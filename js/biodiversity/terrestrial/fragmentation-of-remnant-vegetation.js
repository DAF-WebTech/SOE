var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';

function myTableToHtml(table, hasFoot, decimalPlaces) {
	var ret = { thead: "", tbody: "" };
	ret.thead = "<th scope=col>" + table[0][0];
	if (hasFoot)
		var sums = [];
	for (var i = 1; i < table[0].length; ++i) {
		ret.thead += "<th scope=col class=num>" + table[0][i];
		if (hasFoot)
			sums.push(null);
	}
	for (var i = 1; i < table.length; ++i) {
		ret.tbody += "<tr><th scope=row>" + table[i][0];
		for (var j = 1; j < table[i].length; ++j) {
			ret.tbody += "<td class=num>" + table[i][j].toFixed(decimalPlaces);
			if (hasFoot)
				if (table[i][j] != null)
					sums[j - 1] += table[i][j];
		}
	}

	if (hasFoot) {
		ret.tfoot = "<tfoot><tr><th scope=row>Total";
		sums.forEach(function (s) {
			ret.tfoot += "<th class=num>" + (s == null ? "" : s.toFixed(decimalPlaces));
		});
	}
	return ret;
}


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
// 1. stacked column for proportion
var arrayHead = ["Bioregion", "<1 hectare", "1–10 hectares", "10–100 hectares", "100–1,000 hectares", "1,000–10,000 hectares", "10,000–100,000 hectares", "100,000–1,000,000 hectares", ">1,000,000 hectares", "non-core"];
var arrayTable = [arrayHead];
data.forEach(function (record) {
	var arrayRow = [record[0]];
	for (var i = 2; i < 20; i += 2)
		arrayRow.push(record[i]);
	arrayTable.push(arrayRow);
});

var htmlTable = myTableToHtml(arrayTable, false, 6);
htmlTable.tfoot = "<tfoot><tr><th scope=row>Total<th class=num>1.000000<th class=num>1.000000<th class=num>1.000000<th class=num>1.000000<th class=num>1.000000<th class=num>1.000000<th class=num>1.000000<th class=num>1.000000<th>1.000000";

var heading = "Core Size Distribution: Distribution of core remnant size classes as a proportion of remnant area";
var index = 0;
var region = "queensland";

print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, htmlTable.tfoot));

// table needed a fixed number of decimals, revert to number
for (var i = 1; i < arrayTable.length; ++i)
	for (var j = 1; j < arrayTable[i].length; ++j)
		arrayTable[i][j] = Number(arrayTable[i][j]);

var columnChartOptions = getDefaultColumnChartOptions();
columnChartOptions.vAxis.title = "Proportion of remnant patches";
columnChartOptions.hAxis.title = "Bioregion";
columnChartOptions.isStacked = true;
chartData = [{ type: "column", options: columnChartOptions, data: arrayTable }];

///////////////////////////////////////////////////
// 2. stacked column for count
var arrayHead = ["Bioregion", "<1 hectare", "1–10 hectares", "10–100 hectares", "100–1,000 hectares", "1,000–10,000 hectares", "10,000–100,000 hectares", "100,000–1,000,000 hectares", ">1,000,000 hectares"];
var arrayTable = [arrayHead];
data.forEach(function (record) {
	var arrayRow = [record[0]];
	for (var i = 3; i < 18; i += 2)
		arrayRow.push(record[i] == 0 ? 0 : record[i]);
	arrayTable.push(arrayRow);
});

var htmlTable = myTableToHtml(arrayTable, true, 6);

var heading = "Core Size Density: Count of core remnant size class areas, per 100 square kilometres";

print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, htmlTable.tfoot));

// table needed a fixed number of decimals, revert to number
for (var i = 1; i < arrayTable.length; ++i)
	for (var j = 1; j < arrayTable[i].length; ++j)
		arrayTable[i][j] = Number(arrayTable[i][j]);


chartData.push({ type: "column", options: columnChartOptions, data: arrayTable });


//3. column chart
var arrayHead = ["Bioregion", "Patch", "Edge"];
var arrayTable = [arrayHead];
data.forEach(function (record) {
	var arrayRow = [record[0]];
	arrayRow.push(record[19]);
	arrayRow.push(record[20]);
	arrayTable.push(arrayRow);
});

var htmlTable = myTableToHtml(arrayTable, true, 2);

var heading = "Patch and Edge Density: Count of patch and edge areas, per 100 square kilometres";

print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, htmlTable.tfoot));

// table needed a fixed number of decimals, revert to number
for (var i = 1; i < arrayTable.length; ++i)
	for (var j = 1; j < arrayTable[i].length; ++j)
		arrayTable[i][j] = Number(arrayTable[i][j]);

columnChartOptions = getDefaultColumnChartOptions();
columnChartOptions.vAxis.title = "Number of remnant patches";
columnChartOptions.hAxis.title = "Bioregion";
columnChartOptions.isStacked = false;
chartData.push({ type: "column", options: columnChartOptions, data: arrayTable });


//4. column chart
var arrayHead = ["Bioregion", "Edge", "Patch"];
var arrayTable = [arrayHead];
data.forEach(function (record) {
	var arrayRow = [record[0]];
	arrayRow.push(record[18]);
	arrayRow.push(record[17]);
	arrayTable.push(arrayRow);
});

var htmlTable = myTableToHtml(arrayTable, true, 6);
htmlTable.thead = "<thead><tr><th scope=col rowspan=2>Bioregion<th colspan=2>Proportion of remnant for non-core</th><tr><th scope=col class=num>Edge<th scope=col class=num>Patch";//this one is different
var heading = "Proportion remnant non-core — edge and patch";

print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, htmlTable.tfoot));

// table needed a fixed number of decimals, revert to number
for (var i = 1; i < arrayTable.length; ++i)
	for (var j = 1; j < arrayTable[i].length; ++j)
		arrayTable[i][j] = Number(arrayTable[i][j]);

columnChartOptions = getDefaultColumnChartOptions();
columnChartOptions.series = { 0: { targetAxisIndex: 0 }, 1: { targetAxisIndex: 1 } };
columnChartOptions.vAxes = { 0: { title: "Edge" }, 1: { title: "Patch" } };
columnChartOptions.hAxis = { title: "Bioregion" };
chartData.push({ type: "column", options: columnChartOptions, data: arrayTable });




print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
