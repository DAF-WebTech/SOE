if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

try {
	var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}

var chartData = [];

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 1 is qld., 
var heading = "Loss of woody vegetation";
var index = 0;
result.data.forEach(function(record) {
	if (record.Catchment == record.Subcatchment) {
		var myheading = heading + " in " + record.Catchment;
		var keys = result.meta.fields.slice(3, 5);
		var arrayTable = [["Catchment"]];
		keys.forEach(function(key) {
			arrayTable[0].push(key.replace("_", "–")); // &endash;
		});
		arrayTable.push([record.Catchment, record[keys[0]], record[keys[1]]]);

		var htmlTable = tableToHtml(arrayTable, false)
		print(String.format(regionInfoTemplate, record.Catchment, myheading , index++, htmlTable.thead, htmlTable.tbody));
		
		var options = getDefaultLineChartOptions();
		options.vAxis.title = "Percent (%)"
		options.legend.position = "none";
		for (var i = 0; i < arrayTable[0].length; ++i)
			arrayTable[0][i] = arrayTable[0][i].split(" ")[0];
		chartData.push({data: arrayTable.transpose(), options: options, type: "line" });

	}


});



print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");

