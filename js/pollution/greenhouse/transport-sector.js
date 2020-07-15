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

var categoryData = results.data.slice(0, 8);
var stateData = results.data.slice(8);

var index = 0;


///////////////////////////////////////////////////
// pie 1

var tableData = stateData.map(function (record) {
	return [record[0], record[record.length - 1]];
});

tableData.sort(function (a, b) {
	return a[1] < b[1] ? 1 : -1;
});

var head = ["State", "Emissions (million tonnes)"];
tableData.unshift(head);

var heading = "Proportion of transport emissions by state, " + latestYear;
var index = 0;
var region = "queensland";

var htmlTable = tableToHtml(tableData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


var options = getDefaultPieChartOptions();
options.sliceVisibilityThreshold = 0;


var tables = [{
	data: tableData,
	type: "pie",
	options: options,
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

var heading = "Proportion of Queensland’s transport emissions by category, " + latestYear;

var region = "queensland";

var htmlTable = tableToHtml(tableData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


var options = getDefaultPieChartOptions();
options.sliceVisibilityThreshold = 0;


tables.push({
	data: tableData,
	type: "pie",
	options: options,
});


//////////////////////////////////////////////////////////////////////////////////////
// area

var chart = categoryData;
chart.sort(function (a, b) {
	return a[a.length - 1] < b[b.length - 1] ? 1 : -1;
});
chart.unshift(headRow)
chart[0][0] = "Year"
chart = chart.transpose()

heading = "Trends in Queensland’s transport emissions, by category";
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
// none
var data = stateData[0].slice(1).map(function (row, i) {
	return [headRow[i + 1], row];
});
data.unshift(["Year", "Emissions (million tonnes)"]);

heading = "Queensland’s total transport emissions";
htmlTable = tableToHtml(data, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplateTableOnly, region, heading, index++, htmlTable.thead, htmlTable.tbody));




print("<script id=chartData type=application/json>" + JSON.stringify(tables) + "</" + "script>");