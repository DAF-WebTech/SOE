"use strict";

if (typeof csv == "undefined")
    var csv = "%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%";


try {
var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}


//group records by bioregion
var regions = {};
result.data.forEach(function(record) {
	var key = record.Bioregion;
	if (!regions[key]) {
		regions[key] = [];
	}
	regions[key].push(record);
});

var chartData = [];
var index = 0;
var latestYear = result.meta.fields[result.meta.fields.length - 1];


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 1 for qld stacked columns, pr
var heading = "Proportion of regional ecosystems by biodiversity status, " + latestYear;
var arrayTable = [["Bioregion", "Endangered", "Of concern", "No concern at present"]];
Object.keys(regions).forEach(function(region) {
    var item = [region];
    regions[region].forEach(function(record) {
        item.push(record["Number of regional ecosystem"]);
    });
    arrayTable.push(item);
});

var htmlTable = tableToHtml(arrayTable, false);
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));
chartData.push({ data: arrayTable, type: "column" });
var options = getDefaultColumnChartOptions();
options.hAxis.title = "Bioregion";
options.vAxis.title = "Number of Regional Ecosystems";
options.isStacked = true;
chartData[chartData.length - 1].options = options;


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// qld, coloumn chart for latest year
heading = "Proportion area of biodiversity status, " + latestYear;
arrayTable = [["Bioregion", "Endangered", "Of concern", "No concern at present"]];
Object.keys(regions).forEach(function(region) {
    var item = [region];
    regions[region].forEach(function(record) {
        item.push(record[latestYear]);
    });
    arrayTable.push(item);
});

htmlTable = tableToHtml(arrayTable, false);
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));
chartData.push({ data: arrayTable, type: "column" });
options = getDefaultColumnChartOptions();
options.hAxis.title = "Bioregion";
options.vAxis.title = "Hectares";
options.vAxis.format = "short"
options.isStacked = true;
chartData[chartData.length - 1].options = options;

//##############################################################################
// third qld is the sums of all records
heading = "Trends in extent of remnant vegetation, by biodiversity status";
var years = result.meta.fields.slice(6);
years = years.filter(function(year) { return year != "2006b"});

arrayTable = [["Year", "Endangered", "Of concern", "No concern at present"]];
years.forEach(function(year) {
    arrayTable.push([year, 0, 0, 0]);
});

result.data.forEach(function(record, i) {
    years.forEach(function(year, j) {
        arrayTable[j + 1][(i % 3) + 1] += record[year] });
});

htmlTable = tableToHtml(arrayTable, false);
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody));
chartData.push({ data: arrayTable, type: "line" });
options = getDefaultLineChartOptions();
options.vAxis.title = "Hectares";
options.vAxis.format = "short"
chartData[chartData.length - 1].options = options;


Object.keys(regions).forEach(function(region) {

    //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
    // fourth chart is a pie chart per region
    heading = String.format("Proportion of regional ecosystems by biodiversity status in {0}, {1}", region, latestYear);

    arrayTable = [["Biodiversity status", "Number of regional ecosystems"]];
    regions[region].forEach(function(record) {
        arrayTable.push([record["Biodiversity Status"], record["Number of regional ecosystem"]]);
    });
    htmlTable = tableToHtml(arrayTable, false);
    print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
    
    chartData.push({ data: arrayTable, type: "pie" });
    options = getDefaultPieChartOptions();
    chartData[chartData.length - 1].options = options;
    
    
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    // fifth chart is another pie chart per region
    heading = String.format("Proportion area of biodiversity status in {0}, {1}", region, latestYear);

    arrayTable = [["Biodiversity status", "Number of regional ecosystems"]];
    regions[region].forEach(function(record) {
        arrayTable.push([record["Biodiversity Status"], record[latestYear]]);
    });
    htmlTable = tableToHtml(arrayTable, false);
    print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
    
    chartData.push({ data: arrayTable, type: "pie" });
    options = getDefaultPieChartOptions();
    chartData[chartData.length - 1].options = options;


    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // sixth chart is a line chart for each region showing each status and year
    heading = "Trends in extent of remnant vegetation by biodiversity status in " + region;
    arrayTable = [["Year", "Endangered", "Of concern", "No concern at present"]];
    years.forEach(function(year) {
        arrayTable.push([year, null, null, null]);
    });
    regions[region].forEach(function(record, i) {
        years.forEach(function(year, j) {
            arrayTable[j + 1][i + 1] = record[year];
        });
    });
    htmlTable = tableToHtml(arrayTable, false);
    print(String.format(regionInfoTemplate, region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody));
    
    chartData.push({ data: arrayTable, type: "line" });
    options = getDefaultLineChartOptions();
		options.vAxis.title = "Hectares";
		options.vAxis.format = "short"
    chartData[chartData.length - 1].options = options;



});






print("\n<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>"); 




