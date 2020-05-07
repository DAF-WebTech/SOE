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

var totalQueenslandUrbanArea = data[2][13];

///////////////////////////////////////////////////
var arrayTable = [["", "1999", "current"]];
arrayTable.push(["Hectares", data[1][13], totalQueenslandUrbanArea]);

var heading = "Queensland urban area growth between 1999 and current (current data is composed of regional data sourced at different times)";
var index = 0;
var region = "queensland";

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

arrayTable[0][0] = "Year";
chart1 = arrayTable.transpose();
var columnChartOptions = getDefaultColumnChartOptions(1);
columnChartOptions.vAxis.minValue = 0;
chartData = [{ type: "column", options: columnChartOptions, data: chart1 }];



/////////////////////////////////////////////////////////////////////////////
var totalQueenslandArea = data[0][13];
var queenslandNonUrbanArea = totalQueenslandArea - totalQueenslandUrbanArea;

var arrayTable = [["", "Urban", "Non-Urban"]];
arrayTable.push(["Hectares", totalQueenslandUrbanArea, queenslandNonUrbanArea]);

var heading = "Queensland urban area as a proportion of total state area";

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

arrayTable[0][0] = "Year";
var chart2 = arrayTable.transpose();

var pieChartOptions = getDefaultPieChartOptions(2);
chartData.push({ type: "pie", options: pieChartOptions, data: chart2 });

//////////////////////////////////////////////////////////////////////

print("<h3>Urban area growth between 1999 and current by region (Current data is composed of regional data sourced at different times)</h3>");

var regions = dataHead.slice(1, dataHead.length - 2);


print("<div class=subregions><ul id=regionCheckboxes>");
regions.forEach(function (r, i) {
	print(String.format("<li><input type=checkbox value=\"{0}\" id=checkbox_{0} {2} onchange=\"showHideChart(this)\" /><label for=checkbox_{0}>{1}</label>", r.toKebabCase(), r, i == 0 ? "checked" : ""));
});
print("</ul>");


regions.forEach(function (region, i) {

	arrayTable = [["", "1999", "current"]];
	arrayTable.push(["Hectares", data[1][i + 1], data[2][i + 1]]);

	heading = String.format("{0} urban area growth between 1999 and {1}", region, data[3][i + 1]);

	htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));

	arrayTable[0][0] = "Year";
	arrayTable[0][2] = data[3][i + 1];
	var myChart = arrayTable.transpose();
	columnChartOptions = getDefaultColumnChartOptions(1);
	columnChartOptions.vAxis.minValue = 0;
	columnChartOptions.vAxis.format = "short";
	chartData.push({ type: "column", options: columnChartOptions, data: myChart });



});

print("</div>");

print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
