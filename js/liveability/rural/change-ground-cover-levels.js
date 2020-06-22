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

var index = 0
var heading = "Mean late dry season ground cover (%) in " 
var chartData = []

var years = results.meta.fields.slice(2, results.meta.fields.length - 1)

results.data.forEach(function(record) {

	if (record.Type == "Region") {
		
		var arrayTable = [["Year", "Groundcover (%)"]]

		years.forEach(function(year) {
			arrayTable.push([year, record[year]]);
		})

		var htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 1, maximumFractionDigits: 1})
		print(String.format(regionInfoTemplate, record.Region.toKebabCase(), heading + record.Region, index++, htmlTable.thead, htmlTable.tbody));
		
		chartData.push({ type: "line", data: arrayTable })
		var columnChartOptions = getDefaultLineChartOptions()
		columnChartOptions.vAxis.title = "Groundcover (%)"
		chartData[chartData.length - 1].options = columnChartOptions;
		

	}

})



print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>")