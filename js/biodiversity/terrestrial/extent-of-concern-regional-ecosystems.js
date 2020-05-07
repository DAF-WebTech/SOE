var csv = "%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%";

var chartData = [];
var gauges = [];
var result = [];
var data = {};



try {
var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}




//group records by area 

result.data.forEach(function(record) {
	var key = record["Water quality report card"];
	if (!data[key]) {
		data[key] = [];
	}
	data[key].push(record);
});


  
var templateTableOnly = "\
<div class=\"region-info region-{0}\" {6}>\
	<h4>{1}</h4>\
	<div id=table_{2} class=\"responsive-table sticky\">\
		<table class=\"indicators zebra\">\
			<thead><tr>{3}\
			<tbody>{4}\
			{5}\
		</table>\
	</div>\
</div>";
var templateChartAndTable = "\
<div class=\"region-info region-{0}\" {6}>\
	<h4>{1}</h4>\
	<ul class=chart-tabs data-index={2}>\
	    <li class=active><span>Chart</span>\
	    <li><span>Table</span>\
	</ul>\
	<div class=chart-table>\
		<div id=chart_{2} class=chart></div>\
		<div id=table_{2} class=\"responsive-table sticky inactive\">\
			<table class=\"indicators zebra\">\
				<thead><tr>{3}\
				<tbody>{4}\
				{5}\
			</table>\
		</div>\
	</div>\
</div>";
// key:
// {0} region, used for hide/show on map items
// {1} heading
// {2} 0-based index of chart/table div being added
// {3} table head ths
// {4} table body rows
// {5} table footer often not used.
// {6} extra region attribute




var counter = -1;
var subCatchments = {};
var subCatchmentNames = [];
var checkboxen = "";
Object.keys(data).forEach(function(k) {
    
    var kebab = k.toKebabCase();
    
    // first we'll collate the gauges
    var area = data[k];
    if (k.indexOf("QCatchment") == 0) {

        // it's a 1 to 4 scale
        var gauge = {
            element: "gauge-" + kebab,
            theme: "biodiversity",          
            segments: 4, 
            grade: String(area[0]["Numeric equivalent"]), //assuming there's only one record
            label: area[0].Grade
        };
        if (gauge.grade == "2" || gauge.grade == "3")
            gauge.fontSize = 12;
            
        gauges.push(gauge)
    }
    else if (k.indexOf("Fitzroy") == 0 || k.indexOf("Condamine") == 0) {
        // these have 5 grades, and we have to get the latest one
        var gauge = {
            element: "gauge-" + k.toKebabCase(),
            theme: "biodiversity",          
            segments: 5, 
            grade: String(area[area.length - 1].Grade) //assuming there's only one record
        };
            
        gauges.push(gauge)
    }
    
    var heading = "Report card grades in " + k;

    // now do charts/tables
    if (k.indexOf("Healthy") == 0) {
        //healthy seq get special treatment, because they have sub-regions
        area.forEach(function(a) {
            if (!subCatchments[a["Sub-catchment"]])
                subCatchments[a["Sub-catchment"]] = [];
            subCatchments[a["Sub-catchment"]].push(a)
            //subCatchmentNames.push(area.Year);
        });
        checkboxen += String.format("\n<div class=\"region-info region-{0}\"><h4>Select sub-catchments</h4><ul class=subFindingCheckBox>", kebab);

        // we'll do these separate and last because we have to list checkboxes for each

    }
    else if (area.length == 1) {
        //Those areas with only one record get a plain table, no chart
        var thead = "<th scope=col>Year<th scope=col>" + area[0].Year;
        var tbody = "<tr><th scope=row>Grade<td>" + area[0].Grade;
        var markup = String.format(templateTableOnly, kebab, heading, ++counter, thead, tbody);
        print(markup);

    }
    else {
        // charts and tables
        var thead = "<th scope=col>Year";
        var tbody = "<tr><th scope=row>Grade";
        var chart0 = [[{label: "Year", type: "string"}, "Grade", "Numeric equivalent"]];
        area.forEach(function(a) {
            thead += "<th scope=col>" + a.Year;
            tbody += "<td>" + a.Grade;
            chart0.push([a.Year, a["Numeric equivalent"], a.Grade]);
        });
        var markup = String.format(templateChartAndTable, kebab, heading, ++counter, thead, tbody);
        print (markup);
        
        var chartOptions = getDefaultLineChartOptions();
        chartOptions.legend = { position: "none" };
    	chartOptions.vAxis.title = "Grade";
    	chartOptions.vAxis.ticks=[{v:1, f:"E"}, {v:2, f:"D"}, {v:3, f:"C"}, {v:4, f:"B"}, {v:5, f:"A"}];
    
        chartData.push({
            data: chart0, 
            chartType: "line", 
            chartOptions: chartOptions,
            index: counter
        });

    }

});







Object.keys(subCatchments).forEach(function(s, i) {
    checkboxen += String.format("\n<li><input type=checkbox value={0} data-sub={0} id={0}_checkbox onchange=\"showhidechart(this)\" {2}><label for={0}_checkbox>{1}</label>", s.toKebabCase(), s, i==0 ? "checked" : "");
});
checkboxen += ("</ul>");
print(checkboxen);



var grades = ["not used", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
var ticks = [];
for(var i = 2; i < grades.length; i += 3) {
   ticks.push({v: i, f: grades[i] }); 
}





var templateSubCatchment = "\
<div class=\"subregion-info subregion-{0}\">\
	<h4>{1}</h4>\
	<ul class=chart-tabs data-index={2}>\
	    <li class=active><span>Chart</span>\
	    <li><span>Table</span>\
	</ul>\
	<div class=chart-table>\
		<div id=chart_{2} class=chart></div>\
		<div id=table_{2} class=\"responsive-table sticky inactive\">\
			<table class=\"indicators zebra\">\
				<thead><tr>{3}\
				<tbody>{4}\
				{5}\
			</table>\
		</div>\
	</div>\
</div>";
// {0} sub region, used for hide/show on checkbox change
// {1} heading
// {2} 0-based index of chart/table div being added
// {3} table head ths
// {4} table body rows
// {5} table footer often not used.


var regionKebab = "region-healthy-land-and-water-south-east-queensland-report-card";

Object.keys(subCatchments).forEach(function(k, i) {

    var subCatchment = subCatchments[k];
    var kebab = k.toKebabCase();
    print(String.format(
"<div class=\"subregion-info subregion-{0}\">\
    <h4>{1}</h4>\
    <div id=gauge-{0}></div>\
</div>", kebab, "Report card grades for " + k));

    // charts and tables
    var thead = "<th scope=col>Year";
    var tbody = "<tr><th scope=row>Grade";
    var chart0 = [[{label: "Year", type: "string"}, "Grade", "Numeric equivalent"]];
    subCatchment.forEach(function(s, i) {
        thead += "<th scope=col>" + s.Year;
        tbody += "<td>" + s.Grade;
        chart0.push([s.Year, grades.indexOf(s.Grade), s.Grade]);
        if (i == subCatchment.length - 1) {
            // last one, use this for a gauge
            var gauge = {
                element: "gauge-" + kebab,
                theme: "biodiversity",          
                segments: 4, 
                grade: s.Grade,
                label: s.Grade
            };
            gauges.push(gauge)
        }
    });
    
    var heading = "";//"Report card grades for " + k;
    var markup = String.format(templateSubCatchment, kebab, heading, ++counter, thead, tbody);
    print (markup);
    
    var chartOptions = getDefaultLineChartOptions();
    chartOptions.legend = { position: "none" };
	chartOptions.vAxis.title = "Grade";
	chartOptions.vAxis.ticks = ticks;
	chartOptions.vAxis.viewWindow = { min: 0, max: grades.length };

    chartData.push({
        data: chart0, 
        chartType: "line", 
        chartOptions: chartOptions,
        index: counter,
        kebab: kebab,
        initialShow: i == 0
    });    

});    

print("</div>");

// write the chart data to the page
print("\n<script id=jsonchartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>"); 
print("\n<script id=jsongaugedata type=application/json>" + JSON.stringify(gauges) + "</" + "script>"); 



