var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';

var comparisonTableToHtml = function (table) {

	var ret = { thead: "", tbody: "" };
	ret.thead = "<th scope=col>" + table[0][0];
	for (var i = 1; i < table[0].length; ++i) {
		ret.thead += "<th scope=col class=num>" + table[0][i];
	}
	for (var i = 1; i < table.length; ++i) {
		ret.tbody += "<tr><th scope=row>" + table[i][0];
		for (var j = 1; j < table[i].length; ++j) {
			ret.tbody += "<td class=num>";
			if (table[i][j] != null) {
				ret.tbody += table[i][j].toFixed(table[i][0] == "Queensland" ? 5 : 3);
			}
		}
	}
	return ret;
}


var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true,
	}
);
var headRow = results.data.shift().map(function (th) { return th.toString(); });
var lastIndex = headRow.length - 1;
var latestYear = headRow[lastIndex];
var years = headRow.slice(2);

console.log("data from papaparse", results);

///////////////////////////////////////////////////
// bar

var totals = results.data.filter(function (record) { return record[1] == "Total"; });
var tableData = totals.map(function (record) {
	return [record[0], record[lastIndex]];
});

var head = ["State", "Emissions"];
tableData.unshift(head);

var heading = "Comparison of state and territory land use, land use change and forestry (LULUCF) emissions, " + latestYear;
var index = 0;
var region = "queensland";

var htmlTable = comparisonTableToHtml(tableData, false, Number.prototype.toFixed, [3]);
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var options = getDefaultBarChartOptions();
options.hAxis.title = "Tonnes of carbon dioxide equivalent (million)";
options.legend.position = "none";

var tables = [{
	data: tableData,
	type: "bar",
	options: options,
}];


//////////////////////////////////////////////////////////////////////////////////////
// combo

var qld = results.data.filter(function (record) {
	return record[0] == "Queensland";
});
qld = qld.map(function (record) { return record.slice(1); });

var min = 0;
qld.forEach(function (record) {
	for (var i = 1; i < record.length; ++i)
		min = Math.min(min, record[i]);
});

qld.unshift(["Year"].concat(years));

tableData = qld.transpose();
heading = "Trends in Queensland's net land use, land use change and forestry (LULUCF) emissions, by category";

var htmlTable = tableToHtml(tableData, false, Number.prototype.toFixed, [3]);
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));


options = getDefaultComboChartOptions();
options.vAxis.title = "Tonnes of carbon dioxide equivalent (million)";
options.vAxis.viewWindow = { min: min };
options.seriesType = "area";
options.series = { 6: { type: "line" } };

tables.push({
	data: tableData,
	type: "combo",
	options: options,
});


//////////////////////////////////////////////
// none
var qldTotalRow = results.data.filter(function (record) {
	return record[0] == "Queensland" && record[1] == "Total";
});
var data = qldTotalRow[0].slice(2).map(function (row, i) {
	return [years[i], row];
});
data.unshift(["Year", "Emissions (million tonnes)"]);

heading = "Queensland's total land use, land use change and forestry (LULUCF) emissions";
htmlTable = tableToHtml(data, false, Number.prototype.toFixed, [5]);
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));



print("<script id=chartdata type=application/json>" + JSON.stringify(tables) + "</" + "script>");