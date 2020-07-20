if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
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
var latestYear = dataHead[dataHead.length - 1];

var lastIndex = dataHead.length - 1;

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 1. pie

var records = {};
data.forEach(function (record) {
	if (!records[record[0]])
		records[record[0]] = {};
	records[record[0]][record[1]] = record;
});

var arrayHead = ["Sector", "Emissions (million tonnes)"];
var arrayBody = [];
for (record in records.Queensland) {
	if (record != "All (incl. LULUCF)")
		arrayBody.push([records.Queensland[record][1], records.Queensland[record][lastIndex]]);
}
arrayBody.sort(function (a, b) {
	return a[1] < b[1] ? 1 : -1;
});
var arrayTable = [arrayHead].concat(arrayBody);


var heading = "Proportion of Queensland’s emissions by sector, " + latestYear;
var index = 0;
var region = "queensland";

var htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var chartOptions = getDefaultPieChartOptions();
var chartData = [{ type: "pie", options: chartOptions, data: arrayTable }];


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. bar
arrayHead = ["Sector", "Qld", "NSW", "Vic", "WA", "SA", "NT", "Tas", "ACT"];
arrayBody = [];
Object.keys(records).forEach(function (state) {
	Object.keys(records[state]).forEach(function (sector, i) {
		if (state == "Queensland") //this is first, so we can initialise our rows
			arrayBody.push([sector]);
		arrayBody[i].push(records[state][sector][lastIndex]);
	});
});
arrayBody.shift(); // get rid of "All"
arrayBody.sort(function (a, b) {
	return a[1] < b[1] ? 1 : -1;
});
arrayTable = [arrayHead].concat(arrayBody);

heading = "Comparison of state and territory emissions by sector,  " + latestYear;
htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

arrayTable = arrayTable.transpose()

// we have to multiply by a million
for (var i = 1; i < arrayTable.length; ++i)
	for (var j = 1; j < arrayTable[i].length; ++j)
		arrayTable[i][j] *= 1000000

chartOptions = getDefaultColumnChartOptions();
chartOptions.hAxis.title = "State";
chartOptions.isStacked = true;
chartOptions.vAxis.format = "short"
chartOptions.vAxis.title = "Tonnes";
chartData.push({ type: "column", options: chartOptions, data: arrayTable });

//##########################################################################
// 3. line
var qldRecords = records.Queensland;
var allQld = qldRecords["All (incl. LULUCF)"];
delete qldRecords.All;
arrayHead = ["Year"].concat(dataHead.slice(2));
arrayHead = arrayHead.map(function (h) { return h.toString() }); // turns year Number types into strings
arrayBody = [];
for (sector in qldRecords) {
	arrayBody.push(qldRecords[sector].slice(1));
}
arrayBody.sort(function (a, b) {
	return a[a.length - 1] < b[b.length - 1] ? 1 : -1;
});

arrayTable = [arrayHead].concat(arrayBody);
arrayTable = arrayTable.transpose();

heading = "Trends in Queensland emissions, by sector";
htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

chartOptions = getDefaultLineChartOptions();
chartOptions.isStacked = true;
chartOptions.vAxis.title = "Tonnes (million)";
chartData.push({ type: "line", options: chartOptions, data: arrayTable });

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// 4. no chart
arrayTable = [["Year", "Emissions (million tonnes)"]];
for (var i = 2; i <= lastIndex; ++i)
	arrayTable.push([dataHead[i].toString(), allQld[i]]);

heading = "Total Queensland emissions";
htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
print(String.format(regionInfoTemplateTableOnly, region, heading, index++, htmlTable.thead, htmlTable.tbody));


print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");