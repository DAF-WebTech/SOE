var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true
	}
);

var dataHead = results.data.shift();
var data = results.data;

///////////////////////////////////////////////////
var arrayTable = [["Year"].concat(dataHead.slice(2))];
data.filter(function (d) {
	return d[0] == "Peak";
}).forEach(function (d) {
	arrayTable.push(d.slice(1));
});
arrayTable[2][0] = "Off-Peak";

var heading = "Percentage of network travel time reliability (%)";
var index = 0;
var region = "queensland";

arrayTable = arrayTable.transpose();
var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var chartOptions = getDefaultLineChartOptions();
chartOptions.vAxis.title = "Percentage of on-time reliability on public transport (%)";
var chartData = [{ type: "line", options: chartOptions, data: arrayTable }];


arrayTable = [["Year"].concat(dataHead.slice(6))];
data.filter(function (d) {
	return d[0] == "Reliability";
}).forEach(function (d) {
	arrayTable.push([d[1]].concat(d.slice(6)));
});

heading = "Percentage of on-time reliability of public transport trips in South East Queensland";

arrayTable = arrayTable.transpose();
var htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2})
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

chartData.push({ type: "line", options: chartOptions, data: arrayTable });




print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
