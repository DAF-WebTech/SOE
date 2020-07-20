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

var qldData = results.data.slice(0, 5);
var stateData = results.data.slice(5);
var latestYear = results.meta.fields[results.meta.fields.length - 1];
var keys = results.meta.fields.slice(1);

var index = 0;


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 1. pie

var chartData = ([["State", "Emissions (million tonnes)"]])

stateData.forEach(function (record) {
	chartData.push([record.Category, record[latestYear]]);
});

var region = "queensland";
var heading = "Proportion of stationary energy emissions by state, " + latestYear;
var htmlTable = tableToHtml(chartData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var chartItems = [
	{
		data: chartData,
		type: "pie",
		options: getDefaultPieChartOptions(),
	}
];






//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. pie

var chartData = qldData.map(function (record) {
	return [record.Category, record[latestYear]];
});

chartData.unshift(["Category", "Emissions (million tonnes)"]);

var region = "queensland";
var heading = "Proportion of Queensland’s stationary energy emissions by category, " + latestYear;
var htmlTable = tableToHtml(chartData, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

chartItems.push(
	{
		data: chartData,
		type: "pie",
		options: getDefaultPieChartOptions(),
	});



//###############################################################################
// 3. area
chartData = qldData.map(function (record) {
	var ret = [record.Category];
	keys.forEach(function (y) {
		ret.push(record[y]);
	});
	return ret;
});

var head = ["Year"].concat(keys);
chartData.unshift(head);

chartData = chartData.transpose();

heading = "Trends in Queensland’s stationary energy emissions, by category";
htmlTable = tableToHtml(chartData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

// we have to multiply by a million
for (var i = 1; i < chartData.length; ++i)
	for (var j = 1; j < chartData[i].length; ++j)
		chartData[i][j] *= 1000000


var options = getDefaultAreaChartOptions();
options.isStacked = true;
options.vAxis.format = "short"
options.vAxis.title = "Tonnes";

chartItems.push(
	{
		heading: heading,
		data: chartData,
		type: "area",
		options: options,
	}
);


//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
//  4. table only
var arrayTable = [["Year", "Emissions (million tonnes)"]];
keys.forEach(function (y) {
	arrayTable.push([y, stateData[0][y]]);
});

heading = "Queensland’s total stationary energy emissions";
htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplateTableOnly, region, heading, index++, htmlTable.thead, htmlTable.tbody));


print("<script id=chartData type=application/json>" + JSON.stringify(chartItems) + "</" + "script>");