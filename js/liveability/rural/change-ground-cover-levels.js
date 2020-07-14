if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%'
}

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		dynamicTyping: true,
		header: true
	}
)

var years = results.meta.fields.slice(2, results.meta.fields.length - 1)
var latestYear = years[years.length - 1]

var index = 0
var chartData = []

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 1. combo chart for queensland
var heading = "Mean late dry season ground cover (%), " + latestYear

var arrayTable = [["Region", "Groundcover (%)", "All year mean"]]

results.data.forEach(function(region) {
	if (region.Region != "QLD")
		arrayTable.push([region.Region, region[latestYear], region.AllYearMean ])
})

var htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 1, maximumFractionDigits: 1})
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody))


var chartOptions = getDefaultComboChartOptions()
chartOptions.hAxis.title = "Region"
chartOptions.vAxis.title = "Groundcover (%)"
chartOptions.vAxis.minValue = 0
chartOptions.vAxis.maxValue = 100
chartOptions.pointSize = 3
chartOptions.seriesType = "bars"
chartOptions.series = {1: {type: "line"}} 



chartData.push({ 
	type: "combo",
	data: arrayTable, 
	options: chartOptions 
})


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. line chart for qld
heading = "Mean late dry season ground cover (%) across Queensland"

arrayTable = [["Year", "Groundcover (%)"]]

var qld = results.data[results.data.length - 1]
years.forEach(function(year) {
	arrayTable.push([year, qld[year]])
})

 htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 1, maximumFractionDigits: 1})
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody))

chartOptions = getDefaultLineChartOptions()
chartOptions.vAxis.minValue = 0
chartOptions.vAxis.maxValue = 100
chartOptions.vAxis.title = "Groundcover (%)"

chartData.push({ 
	type: "line",
	data: arrayTable, 
	options: chartOptions 
})




////////////////////////////////////////////////////////////////
// charts per region

heading = "Mean late dry season ground cover (%) in " 

chartOptions.legend.position =  "none"

results.data.forEach(function(record) {

	if (record.Type == "Region") {
		
		arrayTable = [["Year", "Groundcover (%)"]]

		years.forEach(function(year) {
			arrayTable.push([year, record[year]]);
		})

		htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 1, maximumFractionDigits: 1})
		regionName = record.Region == "Mackay Whitsunday" ? "Mackay–Whitsunday" : record.Region
		print(String.format(regionInfoTemplate, record.Region.toKebabCase(), heading + regionName, index++, htmlTable.thead, htmlTable.tbody))
		
		chartOptions = chartOptions
		chartData.push({ 
			type: "line",
			data: arrayTable, 
			options: chartOptions 
		})
	}

})



print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>")