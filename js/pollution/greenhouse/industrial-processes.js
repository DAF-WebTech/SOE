if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true,
	}
);

var headRow = results.data.shift().map(function (th) { return th.toString(); });
var latestYear = headRow[headRow.length - 1];

var categoryData = results.data.slice(0, 6);
var stateData = results.data.slice(6);

var index = 0
var region = "queensland"


///////////////////////////////////////////////////
// pie 1
var heading = "Proportion of industrial processes emissions by state, " + latestYear

var tableData = stateData.map(function (record) {
	return [record[0], record[record.length - 1]];
});

tableData.sort(function (a, b) {
	return a[1] < b[1] ? 1 : -1;
});

var head = ["State", "Emissions (million tonnes)"];
tableData.unshift(head);


var htmlTable = tableToHtml(tableData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


var tables = [{
	data: tableData,
	type: "pie",
	options: getDefaultPieChartOptions(),
}];



///////////////////////////////////////////////////
// pie 2

var tableData = categoryData.map(function (record) {
	return [record[0], record[record.length - 1]];
});

tableData.sort(function (a, b) {
	return a[1] < b[1] ? 1 : -1;
});

var head = ["Category", "Emissions (million tonnes)"];
tableData.unshift(head);

var heading = "Proportion of Queensland’s industrial processes emissions by category, " + latestYear

var region = "queensland";

var htmlTable = tableToHtml(tableData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

tableData = tableData.filter(function(record) {
	return record[1] != "Data is confidential"
});

tables.push({
	data: tableData,
	type: "pie",
	options: getDefaultPieChartOptions(),
});


//////////////////////////////////////////////////////////////////////////////////////
// area
heading = "Trends in Queensland’s industrial processes emissions, by category"

var chart = categoryData;
chart.sort(function (a, b) {
	return a[a.length - 1] < b[b.length - 1] ? 1 : -1;
});
chart.unshift(headRow)
chart[0][0] = "Year"
chart = chart.transpose()


htmlTable = tableToHtml(chart, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


options = getDefaultAreaChartOptions()
options.vAxis.title = "Tonnes (millions)"

tables.push({
	data: chart,
	type: "area",
	options: options,
});


//////////////////////////////////////////////
// table only

heading = "Queensland’s total industrial processes emissions";
var data = stateData[0].slice(1).map(function (row, i) {
	return [headRow[i + 1], row];
});
data.unshift(["Year", "Emissions (million tonnes)"]);


htmlTable = tableToHtml(data, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplateTableOnly, region, heading, index++, htmlTable.thead, htmlTable.tbody));


print("<script id=chartData type=application/json>" + JSON.stringify(tables) + "</" + "script>");