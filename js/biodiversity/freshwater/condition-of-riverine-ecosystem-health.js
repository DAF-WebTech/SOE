"use strict";

if (typeof csv === "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });

//group records by area 
var areas = {};
result.data.forEach(function (d) {
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
var charts = [];
var counter = 0;

var qcatchment = function (catchment) {

	// we write a dial and table
	// note that in 2020 report there was only one line per qcatchment
	var name = catchment["Water quality report card"];

	print(String.format(regionInfoTemplateDialAndTable,
		name.toKebabCase(),
		name,
		counter + 1000,
		"<th scope=col>Year<th scope=col>Grade",
		String.format("<tr><th scope=row>{0}<td>{1}", catchment.Year, catchment.Grade)
	));
	print("<h6>N.B. The range of measures that is used to create the grade may have changed over the years</h6>");

	// create dial data which the front end will populate with vue
	dials.push({
		dial: catchment["Numeric equivalent"] * 2,
		val: catchment.Grade,
		measure: "Condition",
		rankings: ["Good", "Minor Disturbance", "Moderate Disturbance", "Severe Disturbance"],
		region: name.toKebabCase()
	});

	++counter;
}


var getCheckboxes = function (catchment) {
	var checkboxen = ""
	Object.keys(catchment).forEach(function (key, i) {
		if (i == 0) {
			checkboxen += "<h4>Select sub-catchments</h4><ul class=checkbox-list>\n";
		}
		checkboxen += String.format("<li><input type=checkbox id=checkbox-{0} data-subregion={0} class=checkbox-subregion {2} /><label for=checkbox-{0}>{1}</label>\n",
			key.toKebabCase(), key.replace(/-/, "&ndash;"), (i == 0 ? "checked" : ""));
	});
	checkboxen += "</ul>\n";
	return checkboxen;

};

var doCatchments = function (options) {

	var catchment = options.data;
	var name = options.name;

	print(String.format("\n<div class=\"region-info region-{0}\">\n", name.toKebabCase()));

	// print out checkboxes for each subcatchment
	print(getCheckboxes(catchment));


	var grades = options.grades;
	// ticks are are our chart lines
	var ticks = options.ticks;
	var chartOptions = getDefaultLineChartOptions();
	chartOptions.legend = { position: "none" };
	chartOptions.vAxis.title = "Grade";
	chartOptions.vAxis.ticks = ticks;

	Object.keys(catchment).forEach(function (key, i) {
		var name = catchment[key][0]["Water quality report card"];
		var subcatchment = catchment[key];
		var subname = key;

		// create table and chart data
		var tbody = "";
		var chart = [[{ label: "Year", type: 'string' }, { label: "Numeric equivalent", type: 'number' }, { label: "Grade", type: 'string' }]];
		subcatchment.forEach(function (sc) {
			tbody += String.format("<tr><th scope=row>{0}<td>{1}", sc.Year, sc.Grade)
			chart.push([String(sc.Year), grades.indexOf(sc.Grade), sc.Grade]);
		});

		print(String.format(regionInfoTemplateDialAndChart,
			subname.toKebabCase(),
			subname.replace(/-/, "&ndash;"),
			counter,
			"<th scope=col>Year<th>Grade",
			tbody
		));


		charts.push({
			data: chart,
			chartType: "line",
			chartOptions: chartOptions,
			index: counter
		});


		++counter;



		// create dial data which the front end will populate with vue
		var latestYear = subcatchment[subcatchment.length - 1];
		var dialGrade = options.getDialGrade(latestYear.Grade);

		dials.push({
			dial: dialGrade,
			val: latestYear.Grade,
			measure: "Condition",
			rankings: options.rankings,
			region: subname.toKebabCase()
		});


	});

	print("</div>");
}



Object.keys(areas).forEach(function (k) {
	if (k.startsWith("QCatchment")) {
		qcatchment(areas[k][k][0]);
	}
});

// reset the counter because qcatchment didn't have any real charts
counter = 0;

Object.keys(areas).forEach(function (k) {
	if (k.startsWith("QCatchment") || k.startsWith("Reef")) {
		return;
	}

	var options = {
		data: areas[k],
		name: k
	};

	if (k.startsWith("Healthy")) {
		options.grades = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
		options.ticks = [{ v: 0, f: "" }, { v: 2, f: "D" }, { v: 5, f: "C" }, { v: 8, f: "B" }, { v: 11, f: "A" }];
		options.rankings = ["Excellent", "Good", "Fair", "Poor", "Fail"];
		options.getDialGrade = function (grade) {
			if (grade.startsWith("D"))
				return "3";
			else if (grade.startsWith("C"))
				return "5";
			else if (grade.startsWith("B"))
				return "7";
			else if (grade.startsWith("A"))
				return "9";
			else
				return "1";
		}
	}


	if (k.startsWith("Wet") || k.startsWith("Mackay") || k.startsWith("Townsville")) {
		options.rankings = ["Very Good", "Good", "Moderate", "Poor", "Very Poor"];
		options.ticks = [{ v: 0, f: "" }, { v: 1, f: "D" }, { v: 2, f: "C" }, { v: 3, f: "B" }, { v: 4, f: "A" }];
		options.grades = ["E", "D", "C", "B", "A"];
		options.getDialGrade = function (grade) {
			switch (grade) {
				case "D": return "3";
				case "C": return "5";
				case "B": return "7";
				case "A": return "9";
				default: return "1";
			}
		}
	}
	else if (k.startsWith("Fitzroy")) {
		options.rankings = ["Excellent", "Good", "Fair", "Poor", "Fail"];
		options.ticks = [{ v: 0, f: "" }, { v: 1, f: "D" }, { v: 2, f: "C" }, { v: 3, f: "B" }, { v: 4, f: "A" }];
		options.grades = ["E", "D", "C", "B", "A"];
		options.getDialGrade = function (grade) {
			switch (grade) {
				case "D": return "3";
				case "C": return "5";
				case "B": return "7";
				case "A": return "9";
				default: return "1";
			}
		}
	}

	doCatchments(options);

});

// now do the reefs, very different
var reefName = "";
var reefs = {};
Object.keys(areas).forEach(function (k) {
	if (k.startsWith("Reef")) {
		reefName = k;
		// get the reef items
		var data = areas[k][k];
		//group them by their descriptions
		data.forEach(function (d) {
			if (!reefs[d.Description])
				reefs[d.Description] = [];
			reefs[d.Description].push(d);
			d.Subcatchment = d.Description;
		});
	}
});

var printReefDial = function (data, name) {
	print(String.format(dialTemplate));
	dials.push({
		dial: String((data["Numeric equivalent"] * 2) - 1),
		val: data.Grade,
		measure: "Condition",
		rankings: ["Very Good", "Good", "Moderate", "Poor", "Very Poor"],
		region: name.toKebabCase()
	});
}





var printReefLineChart = function (subcatchment, name) {
	
	var tbody = "";
	var chart = [[{ label: "Year", type: 'string' }, { label: "Numeric equivalent", type: 'number' }, { label: "Grade", type: 'string' }]];

	subcatchment.forEach(function (data) {
		tbody += String.format("<tr><th scope=row>{0}<td class=num>{1}", data.Year, data.Grade);
		chart.push([String(data.Year), data["Numeric equivalent"], data.Grade]);
	});
	print(String.format(tableChartInner,
		"Report card grades for " + name,
		counter,
		"<th scope=col>Year<th scope=col class=num>Grade",
		tbody
	));
	var chartOptions = getDefaultLineChartOptions();
	chartOptions.legend = { position: "none" };
	chartOptions.vAxis.title = "Grade";
	chartOptions.vAxis.ticks = [{ v: 1, f: "" }, { v: 2, f: "D" }, { v: 3, f: "C" }, { v: 4, f: "B" }, { v: 5, f: "A" }];
	charts.push({
		data: chart,
		chartType: "line",
		chartOptions: chartOptions,
		index: counter
	});

	++counter;
}

var doReefComboChart = function(subcatchment, name) {

	var tbody = "";
	var chartData = [["Year", "Hectares"]];
	subcatchment.forEach(function (data) {
		tbody += String.format("<tr><th scope=row>{0}<td class=num>{1}", 
			data.Year, 
			data["Loss of extent of natural wetlands/riparian extent (ha)"].toLocaleString());
		chartData.push([String(data.Year), 
			data["Loss of extent of natural wetlands/riparian extent (ha)"]]);
	});
	print(String.format(tableChartInner,
		name,
		counter,
		"<th scope=col>Year<th scope=col class=num>Hectares",
		tbody
	));

// we changed this to a column chart
	var chartOptions = getDefaultColumnChartOptions();
	chartOptions.vAxis.title = "Hectares";
	chartOptions.legend = {position: "none"};
	charts.push({
		data: chartData,
		chartType: "column",
		chartOptions: chartOptions,
		index: counter,
		tooltip: false
	});
	++counter;
}


var doReefPercentLineChart = function(subcatchment, name) {

	var tbody = "";
	var chartData = [["Year", "Percent", {role: "tooltip"}]];
	subcatchment.forEach(function (data) {
		tbody += String.format("<tr><th scope=row>{0}<td class=num>{1}", 
			data.Year, 
			data["Loss of extent of natural wetlands/riparian extent (%)"] + "%");
		var mypercent = data["Loss of extent of natural wetlands/riparian extent (%)"];
		if (typeof (mypercent) == "string") {
			mypercent = Number(mypercent.replace(/</, ""));
		}
		chartData.push([String(data.Year), mypercent, data["Loss of extent of natural wetlands/riparian extent (%)"] + "%"]);
	});
	print(String.format(tableChartInner,
		name,
		counter,
		"<th scope=col>Year<th scope=col class=num>Percent",
		tbody
	));

// we changed this to a column chart
	var chartOptions = getDefaultLineChartOptions();
	chartOptions.vAxis.title = "Percent";
	chartOptions.legend = {position: "none"};
	charts.push({
		data: chartData,
		chartType: "line",
		chartOptions: chartOptions,
		index: counter,
		tooltip: true
	});
	++counter;


}


print(String.format("\n<div class=\"region-info region-{0}\">\n", reefName.toKebabCase()));
print(getCheckboxes(reefs));

//============================================================================
// now we do a separate chart for each reef, which is very specific for each one.
//===========================================================================

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
// Loss of extent of natural wetlands
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 

var name = "Loss of extent of natural wetlands";
var subcatchment = reefs[name];
print(String.format("\n<div class=\"subregion-info subregion-{0}\">\n", name.toKebabCase()));
print(String.format("<h3>{0}</h3>\n", name));
printReefDial(subcatchment[subcatchment.length - 1], name);// latest

//first chart/table is the historic grades in a line
printReefLineChart(subcatchment, name);

// second chart/table is a column for hectares
doReefComboChart(subcatchment, name + " / riparian extent");

// third chart is a line chart for %
doReefPercentLineChart(subcatchment, name);


print("</div>");//~subregion div


// //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
// // •	State of Freshwater Condition
// //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
var name = "State of Freshwater Wetland Condition";
var subcatchment = reefs[name];
print(String.format("\n<div class=\"subregion-info subregion-{0}\">\n", name.toKebabCase()));
print(String.format("<h3>{0}</h3>\n", name));
printReefDial(subcatchment[subcatchment.length - 1], name);// latest

//first chart/table is the historic grades in a line
printReefLineChart(subcatchment, name);

print("</div>");//~subregion div


// //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// // •	Loss of riparian vegetation extent
// //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
var name = "Loss of riparian vegetation extent";
var subcatchment = reefs[name];
print(String.format("\n<div class=\"subregion-info subregion-{0}\">\n", name.toKebabCase()));
print(String.format("<h3>{0}</h3>\n", name));
printReefDial(subcatchment[subcatchment.length - 1], name);// latest

//first chart/table is the historic grades in a line
printReefLineChart(subcatchment, name);

// second chart is a colum chart for ha
doReefComboChart(subcatchment, name);

// third chart is a line chart for %
doReefPercentLineChart(subcatchment, name);



print("</div>");//~subregion div

// //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// // •	Late dry season ground cover
// //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% 
var name = "Late dry season ground cover";
var subcatchment = reefs[name];
print(String.format("\n<div class=\"subregion-info subregion-{0}\">\n", name.toKebabCase()));
print(String.format("<h3>{0}</h3>\n", name));
printReefDial(subcatchment[subcatchment.length - 1], name);// latest

//first chart/table is the historic grades in a line
printReefLineChart(subcatchment, name);

// second chart is the same, but it's based on the percentage column, which makes a few differences
var tbody = "";
var chart = [[{ label: "Year", type: 'string' }, { label: "Percent", type: 'number' }]];

subcatchment.forEach(function (data) {
	tbody += String.format("<tr><th scope=row>{0}<td class=num>{1}", data.Year, data["Late dry season ground cover (%)"]);
	chart.push([String(data.Year), data["Late dry season ground cover (%)"]]);
});

print(String.format(tableChartInner,
	name,
	counter,
	"<th scope=col>Year<th scope=col class=num>Percent",
	tbody
));
var chartOptions = getDefaultLineChartOptions();
//chartOptions.legend = { position: "none" };
chartOptions.vAxis.title = "percent";
charts.push({
	data: chart,
	chartType: "line",
	chartOptions: chartOptions,
	index: counter,
	tooltip: false
});
++counter;


print("</div>");//~subregion div



//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// • Area with target ground cover
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
var name = "Area with target ground cover";
var subcatchment = reefs[name];
print(String.format("\n<div class=\"subregion-info subregion-{0}\">\n", name.toKebabCase()));
print(String.format("<h3>{0}</h3>\n", name));
printReefDial(subcatchment[subcatchment.length - 1], name);// latest

//first chart/table is the historic grades in a line
//this one is table only, because there's only one value
var tbody = String.format("<tr><th scope=row>{0}<td>{1}", subcatchment[0].Year, subcatchment[0].Grade);
print(String.format(tableOnlyInner,
	name,
	counter,
	"<th scope=col>Year<th scope=col>Grade",
	tbody
));

// a second table to show the area percentage
++counter;
tbody = String.format("<tr><th scope=row>{0}<td>{1}", subcatchment[0].Year, subcatchment[0]["Area with target ground cover"]);
print(String.format(tableOnlyInner,
	name,
	counter,
	"<th scope=col>Year<th scope=col>Area with target ground cover (%)",
	tbody
));



print("</div>");//~subregion div


//print("<p>See also: <a href=\"./?a=1434918\">Freshwater wetland ecosystems assessment summary</a>.</p>\n");
print("</div>"); //~ this closes the reef div.region-info




print("\n<script id=chartData type=application/json>" + JSON.stringify(charts) + "</" + "script>");
print("\n<script id=dialData type=application/json>" + JSON.stringify(dials) + "</" + "script>");

