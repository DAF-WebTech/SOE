if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

try {
	var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 1 is qld., 
var heading = "Percent change in the number of fragmentation classes from previous reporting period";

var data = result.data.filter(function(record) {
	return record.REGPage == "Queensland" && record.Figure == 1 ;
});

var keys = result.meta.fields.slice(-3);
var arrayTable = [["Year"]];
keys.forEach(function(key) { 
	arrayTable[0].push(key.replace("unit dependent", "%"));
});
data.forEach(function(record) {
	var item = [record.YEAR];
	keys.forEach(function(key){
		item.push(record[key]);
	});
	arrayTable.push(item);
});

var htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 4, maximumFractionDigits: 4});
var index = 0;
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));

var options = getDefaultColumnChartOptions();
chartData = [{data: arrayTable, options: getDefaultColumnChartOptions() }]; 
chartData[chartData.length - 1].options.vAxis.title = "Percent";


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// chart 2, all Qld

heading = "Density change of fragmentation classes per 1000km² by region, 2015 to 2017";
data = result.data.filter(function(record) {
	return record.REGPage == "Queensland" && record.Figure == 2 ;
});

arrayTable = [["Bioregion"]];
keys.forEach(function(key) { 
	arrayTable[0].push(key.replace("unit dependent", "Count per 1000km²"));
});
data.forEach(function(record) {
	var item = [record.RegName];
	keys.forEach(function(key){
		item.push(record[key]);
	});
	arrayTable.push(item);
});

htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));

chartData.push({data: arrayTable, options: getDefaultColumnChartOptions() }); 
chartData[chartData.length - 1].options.vAxis.title = "Count per 1000km²";
chartData[chartData.length - 1].options.hAxis.title = "Bioregion";

//########################################################################
// chart 3, all Qld 

heading = "Change in the number of fragmentation classes by region, 2015 to 2017";

data = result.data.filter(function(record) {
	return record.REGPage == "Queensland" && record.Figure == 3;
});

arrayTable = [["Bioregion"]];
keys.forEach(function(key) { 
	arrayTable[0].push(key.replace("unit dependent", "Count"));
});
data.forEach(function(record) {
	var item = [record.RegName];
	keys.forEach(function(key){
		item.push(record[key]);
	});
	arrayTable.push(item);
});

htmlTable = tableToHtml(arrayTable, false);
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));


chartData.push({data: arrayTable, options: getDefaultColumnChartOptions() });
chartData[chartData.length - 1].options.vAxis.title = "Count";
chartData[chartData.length - 1].options.hAxis.title = "Bioregion";

// -=-----------------------------------------------------------------
// get the regions and iterate the regions, making charts for each one

var regions = data.map(function(record) {
	return record.RegName;
});


regions.forEach(function(region) {

	// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
	// chart 4 
	heading = "Percent change in the number of fragmentation classes from previous reporting period in " + region;

	data = result.data.filter(function(record) {
		return record.Figure == 1 && record.REGPage == region;
	});
	
	arrayTable = [["Year"]];
	keys.forEach(function(key) { 
		arrayTable[0].push(key.replace("unit dependent", "%"));
	});
	data.forEach(function(record) {
		var item = [record.YEAR];
		keys.forEach(function(key){
			item.push(record[key]);
		});
		arrayTable.push(item);
	});
	
	htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	
	chartData.push({data: arrayTable, options: getDefaultColumnChartOptions() });
	chartData[chartData.length - 1].options.vAxis.title = "Percent";
	chartData[chartData.length - 1].options.hAxis.title = "Year";
			

	// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// chart 5 per region 
	heading = String.format("Density change of fragmentation classes per 1000km² in {0}, 2015 to 2017", region);

	data = result.data.filter(function(record) {
		return record.Figure == 2 && record.REGPage == region;
	});

	// sort these
	data = data.sort(function(x, y) {
		return x.RegName > y.RegName ? 1 : -1;
	});
	
	arrayTable = [["Subregion"]];
	keys.forEach(function(key) { 
		arrayTable[0].push(key.replace("unit dependent", "Count per 1000km²"));
	});
	data.forEach(function(record) {
		var item = [record.RegName.replace(" - ", "–")];//ndash
		keys.forEach(function(key){
			item.push(record[key]);
		});
		arrayTable.push(item);
	});
	
	htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2});
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	
	chartData.push({data: arrayTable, options: getDefaultColumnChartOptions() });
	chartData[chartData.length - 1].options.vAxis.title = "Count per 1000km²";
	chartData[chartData.length - 1].options.hAxis.title = "Subregion";


	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	// chart 6 per region 
	heading = String.format("Change in the number of fragmentation classes in {0}, 2015 to 2017", region);

	data = result.data.filter(function(record) {
		return record.Figure == 3 && record.REGPage == region;
	});

	// sort these
	data = data.sort(function(x, y) {
		return x.RegName > y.RegName ? 1 : -1;
	});
	
	arrayTable = [["Subregion"]];
	keys.forEach(function(key) { 
		arrayTable[0].push(key.replace("unit dependent", "Count"));
	});
	data.forEach(function(record) {
		var item = [record.RegName.replace(" - ", "–")];//ndash
		keys.forEach(function(key){
			item.push(record[key]);
		});
		arrayTable.push(item);
	});
	
	htmlTable = tableToHtml(arrayTable, false);
	print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
	

	chartData.push({data: arrayTable, options: getDefaultColumnChartOptions() });
	chartData[chartData.length - 1].options.vAxis.title = "Count";
	chartData[chartData.length - 1].options.hAxis.title = "Subregion";

	

});


print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");

