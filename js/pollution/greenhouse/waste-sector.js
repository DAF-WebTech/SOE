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

var latestYear = results.meta.fields[results.meta.fields.length - 1]

var categoryData = results.data.slice(0, 4);

var qldData = results.data[4];

var stateData = results.data.slice(4);


var index = 0
var region = "queensland"


///////////////////////////////////////////////////
// pie 1
var heading = "Proportion of waste emissions by state, " + latestYear

var tableChartData = []
stateData.forEach(function(record) {
	tableChartData.push([record.Category, record[latestYear]])
})

tableChartData.sort(function (a, b) {
	return a[1] < b[1] ? 1 : -1;
});

tableChartData.unshift(["State", "Emissions (million tonnes)"]);

var htmlTable = tableToHtml(tableChartData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


var frontEndCharts = [{
	data: tableChartData,
	type: "pie",
	options: getDefaultPieChartOptions(),
}];



///////////////////////////////////////////////////
// pie 2

heading = "Proportion of Queensland’s waste emissions by category, " + latestYear

tableChartData = [];
categoryData.forEach(function(record) {
	tableChartData.push([record.Category, record[latestYear]])
})


tableChartData.sort(function (a, b) {
	return a[1] < b[1] ? 1 : -1;
});

tableChartData.unshift(["Category", "Emissions (million tonnes)"]);

htmlTable = tableToHtml(tableChartData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


frontEndCharts.push({
	data: tableChartData,
	type: "pie",
	options: getDefaultPieChartOptions(),
});


//////////////////////////////////////////////////////////////////////////////////////
// area
heading = "Trends in Queensland’s waste emissions, by category"

tableChartData = [["Year"]];
results.meta.fields.slice(2).forEach(function(year) {
	tableChartData[0].push(year);
})

categoryData.forEach(function(record) {
	var item = [record.Category]
	results.meta.fields.slice(2).forEach(function(year) {
		item.push(record[year]);
	})
	tableChartData.push(item)
})

htmlTable = tableToHtml(tableChartData.transpose(), false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


options = getDefaultAreaChartOptions()
options.vAxis.title = "Tonnes (millions)"

frontEndCharts.push({
	data: tableChartData.transpose(),
	type: "area",
	options: options,
});

//////////////////////////////////////////////
// table only
heading = "Queensland’s total waste emissions";

var tableData = [["Year", "Emissions (million tonnes)"]];

results.meta.fields.slice(2).forEach(function(year) {
	tableData.push([year, qldData[year]]);
})

htmlTable = tableToHtml(tableData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplateTableOnly, region, heading, index++, htmlTable.thead, htmlTable.tbody));


print("<script id=chartData type=application/json>" + JSON.stringify(frontEndCharts) + "</" + "script>");
