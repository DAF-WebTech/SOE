"use strict";

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

var sectorData = results.data.slice(0, 5);
var stateData = results.data.slice(5);
var latestYear = results.meta.fields[results.meta.fields.length - 1];

var index = 0;
var region = "queensland";
var tableChartItems = [];

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 1. column
var heading = "Comparison of state and territory land use, land use change and forestry (LULUCF) emissions, " + latestYear;

var chartTableData = [["State", "Emissions"]]

stateData.forEach(function(record) {
	chartTableData.push([record.Sector, record[latestYear]]);
})

var htmlTable = tableToHtml(chartTableData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var options = getDefaultColumnChartOptions();
options.vAxis.title = "Tonnes of carbon dioxide equivalent (million)";
options.hAxis.title = "State";
options.legend.position = "none"


tableChartItems.push({
	data: chartTableData,
	type: "column",
	options: options,
});


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. area
heading = "Trends in Queensland's net land use, land use change and forestry (LULUCF) emissions, by category"
chartTableData = [["Year"]]
results.meta.fields.slice(1).forEach(function(year) {
	chartTableData[0].push(year);
});

sectorData.forEach(function(record) {
	var chartItem = [record.Sector];
	results.meta.fields.slice(1).forEach(function(year) {
		chartItem.push(record[year]);
	});
	chartTableData.push(chartItem);
});

htmlTable = tableToHtml(chartTableData.transpose(), false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

options = getDefaultAreaChartOptions();
options.vAxis.title = "Tonnes of carbon dioxide equivalent (million)";


tableChartItems.push({
	data: chartTableData.transpose(),
	type: "area",
	options: options,
});


//////////////////////////////////////////////
// none
heading = "Queensland’s total land use, land use change and forestry (LULUCF) emissions";
chartTableData = [["Year", "Emissions (million tonnes)"]]
results.meta.fields.slice(1).forEach(function(year) {
	chartTableData.push([year, stateData[0][year]])
});


htmlTable = tableToHtml(chartTableData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplateTableOnly, region, heading, index++, htmlTable.thead, htmlTable.tbody));


print("<script id=chartData type=application/json>" + JSON.stringify(tableChartItems) + "</" + "script>");