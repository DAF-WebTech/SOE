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
var arrayTable = [["", "1999", "current"]];
arrayTable.push([data[2][0], data[2][14], data[5][14]]);
arrayTable.push([data[3][0], data[3][14], data[6][14]]);
arrayTable.push([data[1][0], data[1][14], data[4][14]]);


var heading = "Queensland rural area growth between 1999 and Current (current data is composed of regional data sourced at different times)";
var index = 0;
var region = "queensland";

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

arrayTable[0][0] = "Year";
chart1 = arrayTable.transpose();
var columnChartOptions = getDefaultColumnChartOptions();
columnChartOptions.isStacked = true;
chartData = [{ type: "column", options: columnChartOptions, data: chart1 }];




/////////////////////////////////////////////////////////////////////////////
var totalQueenslandRuralAreas = data[4][14] + data[5][14] + data[6][14];
var totalQueenslandArea = data[0][14];
var queenslandNonRuralArea = totalQueenslandArea - totalQueenslandRuralAreas;

arrayTable = [["", "Non Rural", "Rural Land in Intensive Use", "Rural Land in Extensive Use", "Rural Land not Settled"]];
arrayTable.push(["Hectares", queenslandNonRuralArea, data[4][14], data[5][14], data[6][14]]);
heading = "Queensland rural area as a proportion of total state area";

htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

arrayTable[0][0] = "Year";
var chart2 = arrayTable.transpose();

var pieChartOptions = getDefaultPieChartOptions();
chartData.push({ type: "pie", options: pieChartOptions, data: chart2 });


//////////////////////////////////////////////////////////////////////

print("<h3>Rural area growth between 1999 and current by region (current data is composed of regional data sourced at different times).</h3>");

var regions = dataHead.slice(2, dataHead.length - 1);

print("<ul id=regionCheckboxes>");
regions.forEach(function (r, i) {
	print(String.format("<li><input type=checkbox value=\"{0}\" id=checkbox_{0} {2} onchange=\"showHideChart(this)\" /><label for=checkbox_{0}>{1}</label>", r.toKebabCase(), r, i == 0 ? "checked" : ""));
});
print("</ul>");


regions.forEach(function (region, i) {

	// this first one goes inside the queensland region, selectable by the checkboxes
	arrayTable = [["", "1999", data[7][i + 2]]];
	arrayTable.push([data[2][0], data[2][i + 2], data[5][i + 2]]);
	arrayTable.push([data[3][0], data[3][i + 2], data[6][i + 2]]);
	arrayTable.push([data[1][0], data[1][i + 2], data[4][i + 2]]);

	heading = String.format("{0} urban area growth between 1999 and {1}", region, data[7][i + 2]);

	htmlTable = tableToHtml(arrayTable, false);
	var extraClass = "region-" + region.toKebabCase();
	if (i > 0)
		extraClass += " initial-hide";
	print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody, "", extraClass));

	arrayTable[0][0] = "Year";
	arrayTable[0][2] = data[7][i + 1];
	var myChart = arrayTable.transpose();
	columnChartOptions = getDefaultColumnChartOptions();
	columnChartOptions.vAxis.title = "Hectares";
	columnChartOptions.vAxis.format = "short";
	columnChartOptions.isStacked = true;
	chartData.push({ type: "column", options: columnChartOptions, data: myChart });

	// we also put it into its own div
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	chartData.push({ type: "column", options: columnChartOptions, data: myChart });

	///////////////////////////////////////
	//the rest go in each div for region
	var regionNonRuralArea = data[0][i + 2] - (data[4][i + 2] + data[5][i + 2] + data[6][i + 2]);

	arrayTable = [["", "Non Rural", "Rural Land in Intensive Use", "Rural Land in Extensive Use", "Rural Land not Settled"]];
	arrayTable.push(["Hectares", regionNonRuralArea, data[4][i + 2], data[5][i + 2], data[6][i + 2]]);
	heading = String.format("{0} Rural area as a proportion of total Region area in {1}", region, data[7][i + 2]);

	htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

	arrayTable[0][0] = "Year";
	var chart2 = arrayTable.transpose();

	var pieChartOptions = getDefaultPieChartOptions();
	pieChartOptions.sliceVisibilityThreshold = 0;
	chartData.push({ type: "pie", options: pieChartOptions, data: chart2 });



});




print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
