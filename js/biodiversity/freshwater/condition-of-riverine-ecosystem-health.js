if (typeof csv === "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });

//group records by area 
var areas = {};
result.data.forEach(function(d) {
	var area = d["Water quality report card"];
	if (!areas[area]) {
		areas[area] = {};
	}
	
	if (!areas[area][d.Subcatchment]) {
		areas[area][d.Subcatchment] = [];
	}
	areas[area][d.Subcatchment].push(d);
});


var dials = [];
var counter = 0;

//First we'll deal with the QCatchment items, they are simplest.
Object.keys(areas).forEach(function(k) {
	if (k.startsWith("QCatchment")) {

		var catchment = areas[k][k][0];

		// we write a dial and table
		// note that in 2020 report there was only one line per qcatchment

		print(String.format(regionInfoTemplateDialAndTable, 
			k.toKebabCase(),
			k,
			counter,
			"<th>Year<th>Grade",
			String.format("<tr><th>{0}<td>{1}", catchment.Year, catchment.Grade)
		));

		// create data which the front end will populate with vue
		dials.push({
			dial: catchment["Numeric equivalent"] * 2,
			val: catchment.Grade,
			measure: "Condition",
			rankings: ["Good", "Minor Disturbance", "Moderate Disturbance", "Severe Disturbance"],
			region: k.toKebabCase()
		});

		++counter;
	}

});





// var counter = -1;
// var subCatchments = {};
// var subCatchmentNames = [];
// var checkboxen = "";
// Object.keys(data).forEach(function (k) {

// 	var kebab = k.toKebabCase();

// 	// first we'll collate the dials
// 	var area = data[k];
// 	if (k.indexOf("QCatchment") == 0) {

// 		// it's a 1 to 4 scale
// 		var numericEquivalents = [0, 2, 4, 6, 8];
// 		dials.push({
// 			dial: numericEquivalents[area["Numeric Equivalent"]],
// 			val: area.Grade,
// 			measure: "Condition",
// 			rankings: ["Good", "Minor Disturbance", "Moderate Disturbance", "Poor"],
// 			region: k.toKebabCase()
//         });

// 	}
// 	else if (k.indexOf("Fitzroy") == 0 /* removed in 20120 || k.indexOf("Condamine") == 0 */) {
// 		var numericEquivalents = [0, 1, 3, 5, 7, 9];
// 		dials.push({
// 			dial: numericEquivalents[area["Numeric Equivalent"]],
// 			val: area.Grade,
// 			measure: "Condition",
// 			rankings: ["Good", "Minor Disturbance", "Moderate Disturbance", "Poor"]
//         });

		
// 	}

// 	var heading = "Report card grades";

// 	// now do charts/tables
// 	if (k.indexOf("Healthy") == 0) {
// 		//healthy seq get special treatment, because they have sub-regions
// 		area.forEach(function (a) {
// 			if (!subCatchments[a["Sub-catchment"]])
// 				subCatchments[a["Sub-catchment"]] = [];
// 			subCatchments[a["Sub-catchment"]].push(a)
// 			//subCatchmentNames.push(area.Year);
// 		});
// 		checkboxen += String.format("\n<div class=\"region-info region-{0}\"><h4>Select sub-catchments</h4><ul class=subFindingCheckBox>", kebab);

// 		// we'll do these separate and last because we have to list checkboxes for each

// 	}
// 	else if (area.length == 1) {
// 		//Those areas with only one record get a plain table, no chart
// 		var thead = "<th scope=col>Year<th scope=col>" + area[0].Year;
// 		var tbody = "<tr><th scope=row>Grade<td>" + area[0].Grade;
// 		var markup = String.format(templateTableOnly, kebab, heading, ++counter, thead, tbody);
// 		print(markup);

// 	}
// 	else {
// 		// charts and tables
// 		var thead = "<th scope=col>Year<th scope=col>Grade";
// 		var tbody = "";
// 		var chart0 = [[{ label: "Year", type: "string" }, "Grade", "Numeric equivalent"]];
// 		area.forEach(function (a) {
// 			tbody += String.format("<tr><th scope=row>{0}<td>{1}", a.Year, a.Grade);
// 			chart0.push([a.Year, a["Numeric equivalent"], a.Grade]);
// 		});
// 		var markup = String.format(templateChartAndTable, kebab, heading, ++counter, thead, tbody);
// 		print(markup);

// 		var chartOptions = getDefaultLineChartOptions();
// 		chartOptions.legend = { position: "none" };
// 		chartOptions.vAxis.title = "Grade";
// 		chartOptions.vAxis.ticks = [{ v: 1, f: "E" }, { v: 2, f: "D" }, { v: 3, f: "C" }, { v: 4, f: "B" }, { v: 5, f: "A" }];

// 		chartData.push({
// 			data: chart0,
// 			chartType: "line",
// 			chartOptions: chartOptions,
// 			index: counter
// 		});

// 	}

// });







// Object.keys(subCatchments).forEach(function (s, i) {
// 	checkboxen += String.format("\n<li><input type=checkbox value={0} data-sub={0} id={0}_checkbox onchange=\"showhidechart(this)\" {2}><label for={0}_checkbox>{1}</label>", s.toKebabCase(), s, i == 0 ? "checked" : "");
// });
// checkboxen += ("</ul>");
// print(checkboxen);



// function getDialNumber (grade) {
// 	switch(grade.charAt()) {
// 		case "D":
// 			return "2";
// 		case "C":
// 			return "4";
// 		case "B":
// 			return "6";
// 		case "A":
// 			return "8"
// 	}
// }

// var templateSubCatchment = "\
// <div class=\"subregion-info subregion-{0} {6}\">\
// 	<h4>{1}</h4>\
// 	<ul class=chart-tabs data-index={2}>\
// 	    <li class=active><span>Chart</span>\
// 	    <li><span>Table</span>\
// 	</ul>\
// 	<div class=chart-table>\
// 		<div id=chart_{2} class=chart></div>\
// 		<div id=table_{2} class=\"responsive-table sticky inactive\">\
// 			<table class=\"indicators zebra\">\
// 				<thead><tr>{3}\
// 				<tbody>{4}\
// 				{5}\
// 			</table>\
// 		</div>\
// 	</div>\
// </div>";
// // {0} sub region, used for hide/show on checkbox change
// // {1} heading
// // {2} 0-based index of chart/table div being added
// // {3} table head ths
// // {4} table body rows
// // {5} table footer often not used.


// var regionKebab = "region-healthy-land-and-water-south-east-queensland-report-card";

// Object.keys(subCatchments).forEach(function (k, i) {

// 	var subCatchment = subCatchments[k];
// 	var grade = subCatchment[subCatchment.length-1].Grade
// 	var kebab = k.toKebabCase();
// 	print(String.format(
// 		// this reproduces [1480411]
// 		"<div id=dial-{0} class=\"subregion-info subregion-{0} {2}\"> \
// 			<h4>Report card grades for {1}</h4> \
// 			<ul class=conditions-container> \
// 			    <li class=condition-dial> \
// 			        <img src=\"./?a=147990{3}:v4'\" alt=\"{4}\" v-bind:title=\"{4}\" /> \
// 			        <h2 class=rank>{4}</h2> \
// 			    </li> \
// 			    <li class=rankings> \
// 			        <h4>Condition rankings:</h4> \
// 			        <ul> \
// 			            <li>Very Good<li>Good<li>Fair<li>Poor<li>Very Poor \
// 			        </ul> \
// 			    </li> \
// 			</ul> \
// 	</div>"
// 	, kebab, k, i == 0 ? "" : "initial-hide"), getDialNumber(grade), grade);

// 	// grades are for our dial
// 	var grades = ["not used", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
// 	// ticks are for our charts to be able to show the  + and -
// 	var ticks = [];
// 	for (var i = 2; i < grades.length; i += 3) {
// 		ticks.push({ v: i, f: grades[i] });
// 	}



// 	// charts and tables

// 	var thead = "<th scope=col>Year";
// 	var tbody = "<tr><th scope=row>Grade";
// 	var chart0 = [[{ label: "Year", type: "string" }, "Grade", "Numeric equivalent"]];
// 	subCatchment.forEach(function (s, i) {
// 		thead += "<th scope=col class=num>" + s.Year;
// 		tbody += "<td>" + s.Grade;
// 		chart0.push([s.Year, grades.indexOf(s.Grade), s.Grade]);
// 		if (i == subCatchment.length - 1) {
// 			// last one, use this for a gauge
// 			dials.push({
// 				dial: getDialNumber(s.Grade),
// 				val: s.Grade,
// 				measure: "Condition",
// 				rankings: ["Very Good", "Good", "Fair", "Poor", "Very Poor"],
// 				region: s["Water quality report card"].toKebabCase(),
// 				subregion: s["Sub-catchment"].toKebabCase()
// 			});
// 		}
// 	});

// 	var heading = "";
// 	var markup = String.format(templateSubCatchment, kebab, heading, ++counter, thead, tbody, "", i == 0 ? "" :"initial-hide");
// 	print(markup);

// 	var chartOptions = getDefaultLineChartOptions();
// 	chartOptions.legend = { position: "none" };
// 	chartOptions.vAxis.title = "Grade";
// 	chartOptions.vAxis.ticks = ticks;
// 	chartOptions.vAxis.viewWindow = { min: 0, max: grades.length };

// 	chartData.push({
// 		data: chart0,
// 		chartType: "line",
// 		chartOptions: chartOptions,
// 		index: counter,
// 		kebab: kebab,
// 	});

// });

// print("</div>");

// write the chart data to the page
//print("\n<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
print("\n<script id=dialData type=application/json>" + JSON.stringify(dials) + "</" + "script>");

