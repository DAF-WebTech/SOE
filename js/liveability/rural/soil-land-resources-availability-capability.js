if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

try {
	var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}

result.data.pop(); //don't need the last row

var chartData = [];

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 1 is qld., 
var heading = "Proportion of land by use";

arrayTable = [["Use", "Hectares"]];
result.data.forEach(function(record) {
	arrayTable.push([record.LABEL, record.Totals]);
});

htmlTable = tableToHtml(arrayTable, false, Number.prototype.toFixed, [2]);
var index = 0;
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));

chartData.push({data: arrayTable});



//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 2 is per region

for (var i = 1; i < result.meta.fields.length - 1; ++i) {
	var region = result.meta.fields[i]

	arrayTable = [["Use", "Hectares"]];
	result.data.forEach(function(record) {
		arrayTable.push([record.LABEL, record[region]]);

	})

	htmlTable = tableToHtml(arrayTable, false, Number.prototype.toFixed, [2]);
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	
	chartData.push({data: arrayTable});
	


}





print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");