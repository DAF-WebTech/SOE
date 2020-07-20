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

var regions = {}
results.data.forEach(function(record) {
	if (! regions[record.Region])
		regions[record.Region] = []
	record.Year = String(record.Year)
	regions[record.Region].push(record)	

})

var index = 0
var heading = "Cropped area by season (million ha) in " 
var chartData = []

var chartOptions = getDefaultColumnChartOptions()
chartOptions.vAxis.format = "short"
chartOptions.vAxis.title = "Hectares"
chartOptions.isStacked = true

Object.keys(regions).forEach(function(regionName) {

	var arrayTable = regions[regionName].map(function(record) {
		var ret = []
		results.meta.fields.slice(1).forEach(function(key) {
			ret.push(record[key])
		})
		return ret
	})

	arrayTable.unshift(results.meta.fields.slice(1))

	if (regionName == "Coastal") { // this one is different, there's no winter
		arrayTable = arrayTable.map(function(item) {
			return item.slice(0, 2)
		})
	}

	var htmlTable = tableToHtml(arrayTable, false, {minimumFractionDigits: 2, maximumFractionDigits: 2})
	print(String.format(regionInfoTemplate, regionName.toKebabCase(), heading + regionName, index++, htmlTable.thead, htmlTable.tbody))
	
	// these numbers are in whole millions, so make them the full amount for chart
	for(var i = 1; i < arrayTable.length; ++i)
		for (var j = 1; j < arrayTable[i].length; ++j)
			arrayTable[i][j] *= 1000000

	chartData.push({ 
		data: arrayTable, 
		options: chartOptions 
	})

})


print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>")