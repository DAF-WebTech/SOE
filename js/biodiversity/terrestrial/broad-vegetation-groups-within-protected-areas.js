
var csv = "%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\":\\"^replace:\r\n:\\n%";
var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true
	}
);

var headData = results.data[0];
var data = results.data.slice(1);

// group the data for our tables
var regions = { queensland: {} };
data.forEach(function(record) {
	var region = record[0];
	if (!regions[region])
		regions[region] = {};
	var group = String.format("{0}. {1}", record[1], record[2]);
	if (!regions.queensland[group]) 
		regions.queensland[group] = { p: 0, np: 0 };
	if (!regions[region][group]) {
		regions[region][group] = { p: 0, np: 0 };
	}
	regions.queensland[group].p += record[4];
	regions[region][group].p = record[4];
	
	regions.queensland[group].np += record[5];
	regions[region][group].np = record[5];

});

var regionNames = Object.keys(regions);

var index = 0;

var chartData = [];

regionNames.forEach(function(regionName) {
	var region = regions[regionName];
	var groupNames = Object.keys(region);

	// write out the values as array
	var table = [["Broad vegetation group", "Protected vegetation", "Non-protected vegetation"]];
	groupNames.forEach(function(groupName) {
		var group = region[groupName];
		table.push([groupName, group.p, group.np]);
	});

	// convert to html
	var htmlTable = tableToHtml(table, true);

	// write out first table
	var year = "2017";
	var heading = String.format("Hectares of broad vegetation groups in protected areas{0}, {1}", 
		regionName == "queensland" ? "" : (" in " + regionName), year);
	print(String.format(regionInfoTemplate, regionName.toKebabCase(), heading, index, htmlTable.thead, htmlTable.tbody, htmlTable.tfoot));

	// chart uses same data layout
	var options = getDefaultColumnChartOptions();
	options.hAxis.title = "Broad Vegetation Group";
	options.vAxis.title = "Hectares";
	options.vAxis.format = "short";
	chartData.push({type: "column", options: options, data: table});

	++index;

	////////////////////////////////////////////////////////////////////////////////////////////////////
	

	table = [["Type", "Area (hectares)"], ["Protected", 0], ["Non-protected", 0]];
	// get a sum of each type
	groupNames.forEach(function(groupName) {
		var group = region[groupName];
		table[1][1] += group.p;
		table[2][1] += group.np;
	});
	htmlTable = tableToHtml(table);
	heading = String.format("Proportion of total remnant vegetation in protected areas{0}, {1}", 
		regionName == "queensland" ? "" : (" in " + regionName), year);
	print(String.format(regionInfoTemplate, regionName.toKebabCase(), heading, index, htmlTable.thead, htmlTable.tbody));

	// chart uses same data layout
	options = getDefaultPieChartOptions();
	chartData.push({type: "pie", options: options, data: table});

	++index;

});

print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
