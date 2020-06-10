var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true,
		header: true
	}
);

var data = results.data;
var latestYear = results.meta.fields[results.meta.fields.length - 1];
var keys = results.meta.fields.slice(1);

///////////////////////////////////////////////////
// pie

var chartData = results.data.map(function (record) {
	return [record.Category, record[latestYear]];
});
chartData.unshift(["Category", "Emissions (million tonnes)"]);

chartData.pop(); // "all"

var index = 0;
var region = "queensland";
var heading = "Proportion of Queensland’s stationary energy emissions by category, " + latestYear;
var htmlTable = tableToHtml(chartData, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var chartItems = [
	{
		data: chartData,
		type: "pie",
		options: getDefaultPieChartOptions(),
	}
];


////////////////////////////////////////////////////////////////////////////////
// area
chartData = results.data.map(function (record) {
	var ret = [record.Category];
	keys.forEach(function (y) {
		ret.push(record[y]);
	});
	return ret;
});

var head = ["Category"].concat(keys);
chartData.unshift(head);
// customise the foot because our data came with it's own foot row and we don't need to calculate it
foot = chartData.pop();

chartData = chartData.transpose();

heading = "Trends in Queensland’s stationary energy emissions, by category";
htmlTable = tableToHtml(chartData, false, {minimumFractionDigits: 3, maximumFractionDigits: 3});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var options = getDefaultAreaChartOptions();
options.isStacked = true;
options.vAxis.title = "Tonnes (millions)";
chartItems.push(
	{
		heading: heading,
		data: chartData,
		type: "area",
		options: options,
	}
);


////////////////////////////////////////////////////////////////////////////////
var arrayTable = [["Year", "Emissions (million tonnes)"]];
var total = results.data[results.data.length - 1];
keys.forEach(function (y) {
	arrayTable.push([y, total[y]]);
});

heading = "Queensland’s total stationary energy emissions";
htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
print(String.format(regionInfoTemplateTableOnly, region, heading, index++, htmlTable.thead, htmlTable.tbody));


print("<script id=chartdata type=application/json>" + JSON.stringify(chartItems) + "</" + "script>");