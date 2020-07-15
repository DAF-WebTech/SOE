var makeChart = function(record, isSubcatchment) {

	var heading = "Loss of riparian woody vegetation";
	var myheading = heading + " in " + record.Subcatchment;

	var keys = result.meta.fields.slice(2, 4);
	var arrayTable = [[""]];
	keys.forEach(function(key) {
		arrayTable[0].push(key.replace("_", "–")); // &endash;
	});
	arrayTable.push([record.Subcatchment, record[keys[0]], record[keys[1]]]);

	var htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	htmlTable.thead = htmlTable.thead.toLowerCase();

	if (isSubcatchment) {
		regionClass = record.Subcatchment.toKebabCase();
		var chartTableMarkup = String.format(regionInfoTemplate, regionClass, myheading , index++, htmlTable.thead, htmlTable.tbody);
		chartTableMarkup = chartTableMarkup.replace("region-info", "");
	}
	else {
		regionClass = record.Catchment.toKebabCase();
		var chartTableMarkup = String.format(regionInfoTemplate, regionClass, myheading , index++, htmlTable.thead, htmlTable.tbody);
	}
	
	print(chartTableMarkup);
	

	arrayTable[0][0] == "Catchment";
	var options = getDefaultLineChartOptions();
	options.vAxis.title = "Percent (%)"
	options.legend.position = "none";
	for (var i = 0; i < arrayTable[0].length; ++i)
		arrayTable[0][i] = arrayTable[0][i].split(" ")[0];
	chartData.push({data: arrayTable.transpose(), options: options, type: "line" });

}


if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

try {
	var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}

var chartData = [];
var index = 0;

var catchments = result.data.filter(function(record) {
	return record.Catchment == record.Subcatchment;
});
var subcatchments = result.data.filter(function(record) {
	return record.Catchment != record.Subcatchment;
});

catchments.forEach(function(record) {

		// make the charts for each catchment area
		makeChart(record, false);

		// make checkboxes
		var div = String.format("<div class='region-info region-{0}'>\n", record.Catchment.toKebabCase());
		div += "<h3>Choose a subcatchment</h3>\n";
		div += "<ul class=subcatchmentCheckboxList>\n";
		subcatchments.forEach(function(subrecord) {
			if (subrecord.Catchment == record.Catchment) {
				div += String.format("<li><input id=subregion_{0} type=checkbox data-subregion={0}><label for=subregion_{0}>{1}</label>\n", 
					subrecord.Subcatchment.toKebabCase(), subrecord.Subcatchment);
			}
		});
		div += "</ul>";
		div += "</div>";
		print (div);
		
		print(String.format("<div class='region-info region-{0}'>\n", record.Catchment.toKebabCase()));
		subcatchments.forEach(function(subrecord) {
			if (subrecord.Catchment == record.Catchment) {
				makeChart(subrecord, true);
			}
		});
		print ("</div>");

	
});




print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");