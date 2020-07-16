function getCheckBoxLabel(region) {

	switch (region) {
		case "SEQ NRM region":
			return "South East Queensland NRM region"
			
		case "NQ Dry Tropics NRM region":
			return "North Queensland Dry Tropics NRM region"

		default:
			return region
	}

}

if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true,
		header: true
	}
);

var data = results.data;
var latestYear = results.meta.fields.slice(-1)[0];
var firstYear = results.meta.fields[3];

// group by region an by category
var regions = {};
var categories = {}
data.forEach(function(record) {
	if (!regions[record.Region])
		regions[record.Region] = [];
	regions[record.Region].push(record);

});


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 1. stacked column chart for qld figures
var heading = String.format("Rural area growth between 1999 and {0}*", latestYear)

var arrayTable = [["Use", "1999", latestYear]];

var qld = regions["Queensland Wide"]
qld.forEach(function(qldRecord) {
	if (qldRecord.Use != "total area mapped")
		arrayTable.push([qldRecord.Use, qldRecord[firstYear], qldRecord[latestYear]])
});

var index = 0;
var region = "queensland";

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody, null, null, null ,"<em>*current data is composed of regional data sourced at different times</em>"));

arrayTable[0][0] = "Time";
chart1 = arrayTable.transpose();
chartData = [{ type: "column", data: chart1 }];
var columnChartOptions = getDefaultColumnChartOptions();
columnChartOptions.isStacked = true;
columnChartOptions.vAxis.title = "Hectares"
chartData[chartData.length - 1].options = columnChartOptions;


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. Pie chart which is just the latest year figures from above
heading = "Proportion of rural and other areas as at " + latestYear

arrayTable = [["Use", latestYear]]

qld = regions["Queensland Wide"]
var totalRural = 0
totalQldArea = 0;
qld.forEach(function(qldRecord) {
	if (qldRecord.Use == "total area mapped") {
		totalQldArea = qldRecord["total area mapped"]
	}
	else {
		arrayTable.push([qldRecord.Use, qldRecord[latestYear]])
		totalRural += qldRecord[latestYear]
	}
})
arrayTable.push(["Non Rural area", totalQldArea - totalRural])

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, region, heading, index++, htmlTable.thead, htmlTable.tbody))

chartData.push({ type: "pie", data: arrayTable })
var pieChartOptions = getDefaultPieChartOptions()
chartData[chartData.length - 1].options = pieChartOptions


/////////////////////////////////////////////////////////////////////
// checkboxes for each region
delete regions["Queensland Wide"];

var checkboxes = "<div class=\"region-info region-queensland\"> \n \
<h3>Rural area growth between 1999 and current by region*</h3> \n \
<ul id=regionCheckboxList> \n";

Object.keys(regions).forEach(function(regionName) {
	var region = regions[regionName];
	checkboxes += String.format("    <li><input type=checkbox id=checkbox_{0} value={0}><label for=checkbox_{0}>{1}</label> \n", regionName.toKebabCase(), getCheckBoxLabel(regionName));
});
checkboxes += "  </ul>\n";



//#################################################################
// 3  these charts show/hide depending on region checkboxes
var subregionTemplate = "\n\
<div class=\"subregion subregion-{0}\"> \n\
		<h4>{1}</h4> \n\
		<ul class=chart-tabs data-index={2}> \n\
				<li class=active><span>Chart</span></li> \n\
				<li><span>Table</span></li> \n\
		</ul> \n\
		<div class=chart-table> \n\
				<div id=chart_{2} class=chart></div> \n\
				<div id=table_{2} class=\"responsive-table sticky inactive\"> \n\
						<table class=\"indicators zebra\"> \n\
							<thead><tr>{3} \n\
							<tbody>{4} \n\
						</table> \n\
				</div> \n\
		</div> \n\
		{5} \n\
</div>\n"

Object.keys(regions).forEach(function(regionName) {
	
	// get the latest year for this region
	var subRegionLatestYear = latestYear;
	var i = results.meta.fields.length - 1
	while (regions[regionName][0][results.meta.fields[i]] == null) {
		--i;
		subRegionLatestYear = results.meta.fields[i]
	}

	heading = String.format("Rural area growth between {0} and {1} in {2}", firstYear, subRegionLatestYear, regionName)

	arrayTable = [["Use", "1999", subRegionLatestYear]]

	regions[regionName].forEach(function(record) {
		if (record.Use != "total area mapped")
			arrayTable.push([record.Use, record[firstYear], record[subRegionLatestYear]])
	});
	
	htmlTable = tableToHtml(arrayTable, false)
	checkboxes += String.format(subregionTemplate, regionName.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody)
	
	arrayTable[0][0] = "Time"
	chartData.push({ type: "column", data: arrayTable.transpose() })

	columnChartOptions = getDefaultColumnChartOptions()
	columnChartOptions.isStacked = true
	columnChartOptions.vAxis.title = "Hectares"
	chartData[chartData.length - 1].options = columnChartOptions
	

})


checkboxes += "</div>";
print(checkboxes);


Object.keys(regions).forEach(function(regionName) {
	
	// get the latest Year
	var subRegionLatestYear = latestYear;
	var i = results.meta.fields.length - 1
	// get the latest Year for this region
	while (regions[regionName][0][results.meta.fields[i]] == null) {
		--i;
		subRegionLatestYear = results.meta.fields[i]
	}

	//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
	// 4. this chart is per region, and a duplicate of the previous
	heading = String.format("Rural area growth between {0} and {1} in {2}", firstYear, subRegionLatestYear, regionName)

	arrayTable = [["Use", "1999", subRegionLatestYear]]

	regions[regionName].forEach(function(record) {
		if (record.Use != "total area mapped")
			arrayTable.push([record.Use, record[firstYear], record[subRegionLatestYear]])
	});
	
	htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, regionName.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody))
	
	arrayTable[0][0] = "Time"
	chartData.push({ type: "column", data: arrayTable.transpose() })

	columnChartOptions = getDefaultColumnChartOptions()
	columnChartOptions.isStacked = true
	columnChartOptions.vAxis.title = "Hectares"
	chartData[chartData.length - 1].options = columnChartOptions
	

	//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	// 5. pie chart per region
	heading = String.format("Proportion of {0} made up of rural and other areas in {1}", regionName, subRegionLatestYear);

	arrayTable = [["Use", subRegionLatestYear]]
	
	var records = regions[regionName]
	var totalRural = 0
	totalArea = 0
	records.forEach(function(record) {
		if (record.Use == "total area mapped") {
			totalArea = record["total area mapped"]
		}
		else {
			arrayTable.push([record.Use, record[subRegionLatestYear]])
			totalRural += record[subRegionLatestYear]
		}
	})
	arrayTable.push(["Non Rural area", totalArea - totalRural])
	
	var htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, regionName.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody))
	
	chartData.push({ type: "pie", data: arrayTable })
	var pieChartOptions = getDefaultPieChartOptions()
	chartData[chartData.length - 1].options = pieChartOptions
	

	//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	// 6. a second pie chart per region
	heading = String.format("Proportion of Queensland area made up of {0} rural", regionName);
	arrayTable = [["Name", "Value"]]
	var records = regions[regionName]
	var totalRural = 0
	records.forEach(function(record) {
		if (record.Use == "total area mapped") {
			arrayTable.push( [regionName, totalRural])
			arrayTable.push(["All other Qld", totalQldArea - totalRural])
		}
		else {
			totalRural += record[latestYear]
		}
	})
	
	var htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, regionName.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody))
	
	chartData.push({ type: "pie", data: arrayTable })
	var pieChartOptions = getDefaultPieChartOptions()
	chartData[chartData.length - 1].options = pieChartOptions

})


print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
