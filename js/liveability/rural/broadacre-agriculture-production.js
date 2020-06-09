if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var headerIndex = 0;
try {
	var result = Papa.parse(csv, { header: true, 
		dynamicTyping: true, 
		skipEmptyLines: true,
		transformHeader: function(header) {
			return headerIndex++ > 7 ? header + "v" : header; // handle our duplicate keys
		}
	});
} catch (e) {
	print(e.name, e.message, e.toString());
}

// group by region
var regions = {};
result.data.forEach(function(record) {

	if (!regions[record.Region])
		regions[record.Region] = [];

	regions[record.Region].push(record);

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


var drawCharts = function(record) { // a row from the data file

			//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// first charts are column chart for tonnes for each region for each product, including queensland as a region

		var heading = String.format("Production amount of {0} in {1}", record.Product, record.Region);

		arrayTable = [["Year", "Tonnes"]];
		var sum = 0;
		var hasNP = false;  // if there's at least one np value, then we'll add the disclaimer
		tonnesYears.forEach(function (key) {
			sum += Number(record[key]);
			arrayTable.push([key.replace("-", "–"), record[key]]); // replace with &ndash;
			hasNP = hasNP ||  record[key] == "n.p.";
		});

		htmlTable = tableToHtml(arrayTable, false);
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

		//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		// second charts are line chart for dollars for each region for each product, including queensland as a region

		heading = String.format("Production value of {0} in {1}", record.Product, record.Region);

		arrayTable = [["Year", "Value"]];
		sum = 0;
		hasNP = false; // if there's at least one np value, then we'll add the disclaimer
		valuesYears.forEach(function (key) {
			sum += Number(record[key]);
			arrayTable.push([key.replace("v", "").replace("-", "–"), record[key]]);
			hasNP = hasNP ||  record[key] == "n.p.";
		});

		htmlTable = tableToHtml(arrayTable, false);
		if (sum == 0) {
			print(String.format(regionInfoTemplateTableOnly, record.Region.toKebabCase(), heading, 9999, htmlTable.thead, htmlTable.tbody));
		}
		else {
			print(String.format(regionInfoTemplate, record.Region.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody, 
				null, null, null, 
				(hasNP ? "NB In 2018–19 some hay crops were not reported at the NRM level due to confidentiality, therefore the sum of the regions does not equal the Queensland total for value and production.  This is indicated by n.p. (not published) " : "")));
			chartData.push({ data: arrayTable, type: "line" });
			var options = getDefaultLineChartOptions();
			options.vAxis.title = "Value ($)";
			chartData[chartData.length - 1].options = options;
		}

}



Object.keys(regions).forEach(function(regionName) {

	regions[regionName].forEach(function(record) {
		if (record.Product == "Total")
			return;

		drawCharts(record); // one row from the data file

	});

});


print("\n\
<div class=\"region-info region-torres-strait-nrm-region\">\n\
		<h4>No data recorded in Torres Strait</h4>\n\
</div>\n");









print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");