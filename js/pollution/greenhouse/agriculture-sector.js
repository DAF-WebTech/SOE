var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true,
		header: true
	}
);

// pull out some meta info
var years = results.meta.fields.slice(1);
var latestYear = years[years.length - 1];
var totalRow = results.data.pop();
var index = 0;

/////////////////////////////////////////// 1. pie

var pie1 = {
	heading: "Proportion of Queensland’s agriculture emissions by category, " + latestYear,
	kebab: "queensland",
	headings: ["Category", "Emissions (million tonnes)"],
	
	// the latest year value for each category	
	rows: results.data.map(function (d) {
		return [d.Category, d[latestYear].toFixed(3)];
	}),
	footer: [totalRow.Category, totalRow[latestYear]]
};

// chart heading
var chart1 = [[{ label: "Category" }, { label: "Emissions (million tonnes)" }]]; 
// convert the string representation in the table back to Number type
pie1.rows.forEach(function (d) {
	chart1.push([d[0], Number(d[1])]);
});
var chartData = [{ data: chart1, type: "pie", options: getDefaultPieChartOptions() }];


/////////////////////////////////////////// 2. line

// build a table directly from the data, but it will need to be transposed
// first row (ie column after transposition) is the year names
var line2rows = [years];
// papaparse converted each row to an object keyed by year, so we conver that back to an array
results.data.map(function (d) {
	var ret = [];
	years.forEach(function (y) {
		ret.push(d[y] ? d[y].toFixed(3) : "0");
	});
	line2rows.push(ret);
});
line2rows = line2rows.transpose();

var line2 = {
	heading: "Trends in Queensland’s agriculture emissions, by category",
	kebab: "queensland",
	headings: ["Year"].concat(results.data.map(function (d) { return d.Category })),
	rows: line2rows
};

// convert the formatted string for each value back to a Number type
var chart2 = line2rows.map(function (row) {
	return row.map(function (d, i) { return i == 0 ? d : Number(d) });
});

// add the table's headings to the top of the chart data array
chart2.unshift(line2.headings);

var lineChartOptions = getDefaultLineChartOptions();
lineChartOptions.vAxis.title = "Tonnes (million)";
chartData.push({ data: chart2, type: "line", options: lineChartOptions });


/////////////////////////////////////////// 3. table

var table3 = {
	heading: "Queensland’s total agriculture emissions",
	kebab: "queensland",
	headings: ["Year", "Emissions (million tonnes)"],
	// this data is the year and the value in the Total row
	rows: years.map(function (y) {
		return [y, totalRow[y].toFixed(3)]
	}),
	hasNoChart: true
};

var regions = { regions: [pie1, line2, table3] };

var template = Handlebars.compile(chartTableTemplate);
print(template(regions));



print("<script id=chartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>");
