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
var charts = [];
var counter = 0;

var qcatchment = function(catchment) {

		// we write a dial and table
		// note that in 2020 report there was only one line per qcatchment
		var name = catchment["Water quality report card"];

		print(String.format(regionInfoTemplateDialAndTable, 
			name.toKebabCase(),
			name,
			counter + 1000,
			"<th>Year<th>Grade",
			String.format("<tr><th>{0}<td>{1}", catchment.Year, catchment.Grade)
		));

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

var doCatchments = function(options) {

	var catchment = options.data;
	var name = options.name;

	print(String.format("<div class=\"region-info region-{0}\">", name.toKebabCase()));

	// print out checkboxes for each subcatchment
	var checkboxen = ""
	Object.keys(catchment).forEach(function(key, i) {
		if (i == 0) {
			checkboxen += "<h4>Select sub-catchments</h4><ul class=checkbox-list>";
		}
		checkboxen += String.format("<li><input type=checkbox id=checkbox-{0} data-subregion={0} class=checkbox-subregion {2} /><label for=checkbox-{0}>{1}</label>",
		key.toKebabCase(), key, (i == 0 ? "checked" : ""));
	});
	checkboxen += "</ul>";
	print(checkboxen);


	var grades = options.grades;
	// ticks are are our chart lines
	var ticks = options.ticks;
	var chartOptions = getDefaultLineChartOptions();
	chartOptions.legend = { position: "none" };
	chartOptions.vAxis.title = "Grade";
	chartOptions.vAxis.ticks = ticks;

	Object.keys(catchment).forEach(function(key, i) {
		var name = catchment[key][0]["Water quality report card"];
		var subcatchment = catchment[key];
		var subname = key;

		// create table and chart data
		var tbody = "";
		var chart = [[{ label: "Year", type: 'string' }, { label: "Numeric equivalent", type: 'number' }, { label: "Grade", type: 'string' }]];
		subcatchment.forEach(function(sc) {
			tbody += String.format("<tr><th>{0}<td>{1}", sc.Year, sc.Grade)
			chart.push([String(sc.Year), grades.indexOf(sc.Grade), sc.Grade]);
		});

		print(String.format(regionInfoTemplateDialAndChart, 
			subname.toKebabCase(),
			subname.replace(/-/, "&ndash;"),
			counter,
			"<th>Year<th>Grade",
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

var reef = function(reefs) {

}





Object.keys(areas).forEach(function(k) {
	if (k.startsWith("QCatchment")) {
		qcatchment(areas[k][k][0]);
	}
});

// reset the counter
counter = 0;
Object.keys(areas).forEach(function(k) {
	if (k.startsWith("QCatchment")) {
		return;
	}

	if (k.startsWith("Reef")) {
		//reef(areas[k]);
	}
	else {
		var options = {
			data: areas[k], 
			name: k
		};

		if (k.startsWith("Healthy")) {
			options.grades = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
			options.ticks = [{v:0, f: ""}, {v:2, f: "D"}, {v:5, f: "C"}, {v:8, f: "B"}, {v:11, f: "A"} ];
			options.rankings = ["Excellent", "Good", "Fair", "Poor", "Fail"];
			options.getDialGrade = function(grade) {
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
			options.ticks = [{v:0, f: ""}, {v:1, f: "D"}, {v:2, f: "C"}, {v:3, f: "B"}, {v:4, f: "A"} ];
			options.grades = ["E", "D", "C", "B", "A"];
			options.getDialGrade = function(grade){
				switch(grade) {
					case "D" : return "3";
					case "C" : return "5";
					case "B" : return "7";
					case "A" : return "9";
					default: return "1";
				}
			}
		}
		else if (k.startsWith("Fitzroy")) {
			options.rankings = ["Excellent", "Good", "Fair", "Poor", "Fail"];
			options.ticks = [{v:0, f: ""}, {v:1, f: "D"}, {v:2, f: "C"}, {v:3, f: "B"}, {v:4, f: "A"} ];
			options.grades = ["E", "D", "C", "B", "A"];
			options.getDialGrade = function(grade){
				switch(grade) {
					case "D" : return "3";
					case "C" : return "5";
					case "B" : return "7";
					case "A" : return "9";
					default: return "1";
				}
			}
		}

		doCatchments(options);
	}
});




print("\n<script id=chartData type=application/json>" + JSON.stringify(charts) + "</" + "script>");
print("\n<script id=dialData type=application/json>" + JSON.stringify(dials) + "</" + "script>");

