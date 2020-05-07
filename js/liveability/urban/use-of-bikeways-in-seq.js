var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true
	}
);

results.data[0][0] = "Location";

var heading = String.format("Daily use of bikeways {0} to {1}", results.data[0][1], results.data[0][results.data[0].length - 1]);

var htmlTable = tableToHtml(results.data, false)
print(String.format(regionInfoTemplate, "queensland", heading, 0, htmlTable.thead, htmlTable.tbody));

results.data[0][0] = "Year";
results.data[0].forEach(function (th, i, a) {
	a[i] = th.toString();
});

var columnChartOptions = getDefaultColumnChartOptions();
columnChartOptions.vAxis.title = "Average daily count";
chartData = [{ type: "column", options: columnChartOptions, data: results.data }];




print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");