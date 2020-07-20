if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

try {
	var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}

var chartData = [];
var keys = result.meta.fields.slice(1);


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 1 is qld., 
var heading = "Change in available soil and land resources";


arrayTable = [["Use", "Hectares"]];
keys.forEach(function (key) {
	var sum = 0;
	result.data.forEach(function (record) {
		sum += record[key];
	});
	arrayTable.push([key, sum]);
});

htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
var index = 0;
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));

chartData.push({ data: arrayTable });
var options = getDefaultColumnChartOptions();
options.vAxis.format = "short"
options.vAxis.title = "Hectares";
options.hAxis.title = "Land use classification";
options.legend.position = "none"
chartData[chartData.length - 1].options = options;



//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 2 is qld., 
heading = "Percentage change in area between 1999 and 2019"

// this is using some data that is no in the data file
var extras = [159430.1909, 60492.80844, 1284568.803, 23188.99982, 15831.8042, 8126.537534, 76852.24199, 69056.69311, 32931.02996];

arrayTable = [["Use", "Percent Change"]];
keys.forEach(function (key, i) {
	var sum = 0;
	result.data.forEach(function (record) {
		sum += record[key];
	});
	arrayTable.push([key, sum / extras[i] * 100]);
});

htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));

chartData.push({ data: arrayTable });
var options = getDefaultColumnChartOptions();
options.vAxis.title = "Percentage change in land classification (%)";
options.hAxis.title = "Land use classification";
options.legend.position = "none"
chartData[chartData.length - 1].options = options;


//######################################################################
// chart 3 is per region 

result.data.forEach(function(record) {

	heading = "Change in available soil and land resources in " + record.Region;


	arrayTable = [["Use", "Change"]];
	keys.forEach(function (key) {
		arrayTable.push([key, record[key]]);
	});
	
	htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	print(String.format(regionInfoTemplate, record.Region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	
	chartData.push({ data: arrayTable });
	var options = getDefaultColumnChartOptions();
	options.vAxis.title = "Hectares";
	options.hAxis.title = "Land use Classification";
	options.legend.position = "none"
	chartData[chartData.length - 1].options = options;
	

});


print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");