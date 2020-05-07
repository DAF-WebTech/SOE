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

var heading = "Percentage of network with good travel time reliability";
var index = 0;
var region = "queensland";

arrayTable = arrayTable.transpose();
var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

var chartOptions = getDefaultLineChartOptions();
chartOptions.vAxis.title = "Percentage";
var chartData = [{ type: "line", options: chartOptions, data: arrayTable }];


//////////////////////////////////////////////////////////
// millions of trips by transport mode, data not supplied in 2020
/*		arrayTable = [["Quarter"]];
		var numberTripsIndex = [];
		data.forEach(function (d, i) {
			if (d[0] == "Number of trips") {
				arrayTable.push([d[1]]);
				numberTripsIndex.push(i);
			}
		});
		for (var i = qFirstIndex; i < dataHead.length; ++i) {
			arrayTable[0].push(dataHead[i]);

			numberTripsIndex.forEach(function (j) {
				arrayTable[j - 2].push(data[j][i]);
			});

		}

		heading = "Millions of Trips by Public Transport Mode in SEQ";
		htmlTable = tableToHtml(arrayTable, false, Number.prototype.toFixed, [2])
		print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

		var chart2 = arrayTable.transpose();
		chartOptions = getDefaultColumnChartOptions();
		chartOptions.vAxis.title = "Trips (millions)";
		chartData.push({ type: "column", options: chartOptions, data: chart2 });

*/
//////////////////////////////////////////////////////////////

arrayTable = [["Year"].concat(dataHead.slice(6))];
data.filter(function (d) {
	return d[0] == "Reliability";
}).forEach(function (d) {
	arrayTable.push([d[1]].concat(d.slice(6)));
});

heading = "On-Time Running by Public Transport Mode in SEQ — % of Trips";

arrayTable = arrayTable.transpose();
var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody));

chartData.push({ type: "line", options: chartOptions, data: arrayTable });




print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
