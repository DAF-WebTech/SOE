if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

try {
	var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });
} catch (e) {
	print(e.name, e.message, e.toString());
}

var chartData = [];

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 1 is qld., 
var heading = "Proportion of land by use, 2019";
var keys = result.meta.fields.slice(1);

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


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 2 is per region
result.data.forEach(function (record) {

	var heading = "Proportion of land by use in " + record.Region;
	arrayTable = [["Use", "Hectares"]];
	keys.forEach(function (key) {
		arrayTable.push([key, record[key]]);

	})

	htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	print(String.format(regionInfoTemplate, record.Region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));

	chartData.push({ data: arrayTable });

});

print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");