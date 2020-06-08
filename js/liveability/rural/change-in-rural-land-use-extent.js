if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true,
		header: true
	}
);

var data = results.data;
var latestYear = results.meta.fields.slice(-1)[0];
var firstYear = results.meta.fields[3];

// group by region an by category
var regions = {};
var categories = {}
data.forEach(function(record) {
	if (!regions[record.Region])
		regions[record.Region] = [];
	regions[record.Region].push(record);

	if (record.Use != "total area mapped") {
		if(!categories[record.Use])
			categories[record.Use] = [];
		categories[record.Use].push(record);
	}
});


///////////////////////////////////////////////////
// 1. stacked column chart for qld figures
var arrayTable = [["", "1999", "current"]];

Object.keys(categories).forEach(function(category) {
	var start = 0, current = 0;
	var records = categories[category];
	records.forEach(function(record) {
		start += record[firstYear];
		var i = results.meta.fields.length - 1;
		while (record[results.meta.fields[i]] == null)
			--i;
			current += record[results.meta.fields[i]];
	});
	arrayTable.push([category, start, current]);

});

var heading = "Queensland rural area growth between 1999 and Current*";
var index = 0;
var region = "queensland";

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, null, null, null, "current data is composed of regional data sourced at different times"));

arrayTable[0][0] = "Time";
chart1 = arrayTable.transpose();
var columnChartOptions = getDefaultColumnChartOptions();
columnChartOptions.isStacked = true;
chartData = [{ type: "column", options: columnChartOptions, data: chart1 }];


//////////////////////////////////////////////////////////////////
// 2. Pie chart
heading = "Queensland rural area as a proportion of total state area";






///////////////////////////////////////////////////////////////////
// 3a. checkboxes for each region
var checkboxes = "<div class=\"region-info region-queensland\"> \n";
checkboxes += "  <ul id=regioncheckboxlist> \n";
Object.keys(regions).forEach(function(regionName, i) {
	var region = regions[regionName];
	checkboxes += String.format("    <li><input type=checkbox id=checkbox_{0} value={0} {2} onclick=showHideChart><label for=checkbox_{0}>{1}</label> \n", regionName.toKebabCase(), regionName, (i == 0 ? "checked" : ""));
});
checkboxes += "  </ul>\n";
checkboxes += "</div>";


//////////////////////////////////////////////////////////////////////
// 3b.  these charts show/hide depending on region checkboxes
heading = "Rural area growth between 1999 and current by region*";


// I"m waiting on a  better explanation from the data file of what they want here.



"Current data is composed of regional data sourced at different times"








print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
