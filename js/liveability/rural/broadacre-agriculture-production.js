"use strict";

if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var headerIndex = 0;
try {
	var result = Papa.parse(csv, {
		header: true,
		dynamicTyping: true,
		skipEmptyLines: true,
		transformHeader: function (header) {
			return headerIndex++ > 7 ? header + "v" : header; // handle our duplicate keys
		}
	});
} catch (e) {
	print(e.name, e.message, e.toString());
}

// group by region
var SQ_REGION = "Southern Queensland NRM region";
var regions = {};
var sq = {};
result.data.forEach(function (record) {

	if (record.Product == "Total") return;

	if (record.Region == SQ_REGION) {
		if (!sq[record.SubRegion])
			sq[record.SubRegion] = [];
		sq[record.SubRegion].push(record);
	}
	else {
		if (!regions[record.Region])
			regions[record.Region] = [];
		regions[record.Region].push(record);
	}
});

delete regions["Torres Strait NRM region"]; // no data for this one


// get some keys
var tonnesYears = result.meta.fields.slice(4, 7);
var valuesYears = result.meta.fields.slice(-3);

// used by all iterations
var chartData = [];
var index = 0;

//!!!!!!!!!!!!!!!!!!!
// TOOD: Southern Queensland NRM region has multiple subregions
// find out what we are to do


var drawColumnCharts = function (record, isSQSubregion) { // a row from the data file

	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// first charts are column chart for tonnes for each region for each product, including queensland as a region

	var heading = String.format("Production amount of {0} in {1} {2}", 
		record.Product, 
		record.Region,
		(isSQSubregion ? " — " + record.SubRegion : "")
	);

	var arrayTable = [["Year", "Tonnes"]];
	var sum = 0;
	var hasNP = false;  // if there's at least one np value, then we'll add the disclaimer
	tonnesYears.forEach(function (key) {
		sum += Number(record[key]);
		arrayTable.push([key.replace("-", "–"), record[key]]); // replace with &ndash;
		hasNP = hasNP || record[key] == "n.p.";
	});

	var htmlTable = tableToHtml(arrayTable, false);
	if (sum == 0) {
		print(String.format(regionInfoTemplateTableOnly, record.Region.toKebabCase(), heading, 9999, htmlTable.thead, htmlTable.tbody));
	}
	else {
		print(String.format(regionInfoTemplate, record.Region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody,
			null, null, null,
			(hasNP ? "NB In 2018–19 some hay crops were not reported at the NRM level due to confidentiality, therefore the sum of the regions does not equal the Queensland total for value and production.  This is indicated by n.p. (not published) " : "")));
		chartData.push({ data: arrayTable, type: "column" });
		var options = getDefaultColumnChartOptions();
		options.vAxis.title = "Tonnes";
		chartData[chartData.length - 1].options = options;
	}

}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// second charts are line chart for dollars for each region for each product, including queensland as a region
var drawLineChart = function (records, regionName, isSQSubregion) {

	var heading = String.format("Production values in {0} {1}", 
		regionName, 
		(isSQSubregion ? " — " + record.SubRegion : "")
	);

	var arrayTable = [["Product"]];
	valuesYears.forEach(function(year) {
		arrayTable[0].push(year.replace("-", "–").replace("v", ""));
	});
	records.forEach(function(record) {
		var row = [record.Product];
		valuesYears.forEach(function(year) {
			row.push(record[year]);
		});
		arrayTable.push(row);
	});

	var htmlTable = tableToHtml(arrayTable, false);
	
	arrayTable = arrayTable.transpose();

	var hasNP = false;
	// if (sum == 0) {
	// 	print(String.format(regionInfoTemplateTableOnly, regionName.toKebabCase(), heading, 9999, htmlTable.thead, htmlTable.tbody));
	// }
	// else {
		print(String.format(regionInfoTemplate, regionName.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody,
			null, null, null,
			(hasNP ? "NB In 2018–19 some hay crops were not reported at the NRM level due to confidentiality, therefore the sum of the regions does not equal the Queensland total for value and production.  This is indicated by n.p. (not published) " : "")));
		chartData.push({ data: arrayTable, type: "line" });
		var options = getDefaultLineChartOptions();
		options.vAxis.title = "Value ($)";
		chartData[chartData.length - 1].options = options;
//	}

};

Object.keys(regions).forEach(function (regionName) {

	regions[regionName].forEach(function (record) {
		drawColumnCharts(record); // one row from the data file
	});

	drawLineChart(regions[regionName], regionName); // array of lines from the data file

});

Object.keys(sq).forEach(function (regionName) {

	sq[regionName].forEach(function (record) {
		drawColumnCharts(record, true); // one row from the data file, true to show it's subregions
	});

	drawLineChart(sq[regionName], SQ_REGION); // array of lines from the data file

});



print("\n\
<div class=\"region-info region-torres-strait-nrm-region\">\n\
		<h4>No data recorded in Torres Strait</h4>\n\
</div>\n");









print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");