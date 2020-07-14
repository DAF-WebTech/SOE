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

var airsheds = {};
results.data.forEach(function(record) {
	if (!airsheds[record.Airshed])
		airsheds[record.Airshed] = [];
		airsheds[record.Airshed].push(record);
})

var years = results.meta.fields.slice(2);

var index = 0;
var region = "queensland";

var frontEndCharts = [];

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 1. Column chart
var heading = "Number of days when the 24-hour PM<sub>10</sub> concentrations exceeded the Air NEPM standards"

var data = results.data.filter(function(record) {
	return record["Air quality standard"] == "24 hour PM10 concentrations exceeded (days)"
})

var head = ["Year"];
years.forEach(function(year) {
	head.push(year)
})

var tableChartData = [head];
data.forEach(function(record) {
	var item = [record.Airshed];
	years.forEach(function(year) {
		item.push(record[year]);
	})
	tableChartData.push(item);
})

var htmlTable = tableToHtml(tableChartData.transpose(), false);
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var options = getDefaultColumnChartOptions()
options.vAxis.title = "Number of days"

frontEndCharts.push({
	data: tableChartData.transpose(),
	type: "column",
	options: options,
});


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2 second chart
heading = "Number of days when the 24-hour PM<sub>2.5</sub> concentrations exceeded the Air NEPM standards"

data = results.data.filter(function(record) {
	return record["Air quality standard"] == "24 hour PM2.5 concentrations exceeded (days)"
})

tableChartData = [head]; // reuse head from previous
data.forEach(function(record) {
	var item = [record.Airshed];
	var isNull = true;
	years.forEach(function(year) {
		item.push(record[year]);
		isNull = isNull && record[year] == null;
	})
	if (!isNull)
		tableChartData.push(item);
})


htmlTable = tableToHtml(tableChartData.transpose(), false);
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

frontEndCharts.push({
	data: tableChartData.transpose(),
	type: "column",
	options: options,
});


//####################################################################
// 3 third chart
heading = "Annual average PM<sub>10</sub> concentrations (µg/m<sup>3</sup>)"

data = results.data.filter(function(record) {
	return record["Air quality standard"] == "Annual average PM10 concentrations (micrograms/m3)"
})

tableChartData = [head]; // reuse head from previous
data.forEach(function(record) {
	var item = [record.Airshed];
	var isNull = true;
	years.forEach(function(year) {
		item.push(record[year]);
		isNull = isNull && record[year] == null;
	})
	if (!isNull)
		tableChartData.push(item);
})


htmlTable = tableToHtml(tableChartData.transpose(), false);
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

frontEndCharts.push({
	data: tableChartData.transpose(),
	type: "column",
	options: options,
});



//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// 4 fourth chart
heading = "Annual average PM<sub>2.5</sub> concentrations (µg/m<sup>3</sup>)"

data = results.data.filter(function(record) {
	return record["Air quality standard"] == "Annual average PM2.5 concentrations (micrograms/m3)"
})

tableChartData = [head]; // reuse head from previous
data.forEach(function(record) {
	var item = [record.Airshed];
	var isNull = true;
	years.forEach(function(year) {
		item.push(record[year]);
		isNull = isNull && (record[year] == null || record[year] == "Insufficient data");
	})
	if (!isNull)
		tableChartData.push(item);
})


htmlTable = tableToHtml(tableChartData.transpose(), false);
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

frontEndCharts.push({
	data: tableChartData.transpose(),
	type: "column",
	options: options,
});




print("<script id=chartData type=application/json>" + JSON.stringify(frontEndCharts) + "</" + "script>");