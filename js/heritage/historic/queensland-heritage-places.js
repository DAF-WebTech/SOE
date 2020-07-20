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

var chartData = []
var index = 0
var keys = results.meta.fields.slice(1, 12)
var endKeys = results.meta.fields.slice(-3)

var options = getDefaultColumnChartOptions()
options.legend.position = "none"
options.vAxis.title = "Number of places"
options.vAxis.format = "short"
options.vAxis.minValue = 0


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// queensland total by year, column chart
var heading = "Number of places on the heritage register in Queensland"

var sums = {}
keys.forEach(function(key) {
	sums[key] = 0
})

// iterate each row and add up the values
var result = results.data.reduce(function(accumulator, currentValue) {
	keys.forEach(function(key) {
		accumulator[key] += Number(currentValue[key]);
	})
	return accumulator
}, sums)

var arrayTable = [["Year", "Number of places"]]
Object.keys(result).forEach(function(key) {
	arrayTable.push([key, result[key]])
})

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody))

chartData.push({ options: options, data: arrayTable })

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. queensland table only
heading = "Number of places entered, removed and merged from the heritage register in Queensland, " + endKeys[0].split(" ")[1].replace("-", "&ndash;")

sums = {}
endKeys.forEach(function(key) {
	sums[key] = 0
})

// iterate each row and add up the values
result = results.data.reduce(function(accumulator, currentValue) {
	endKeys.forEach(function(key) {
		accumulator[key] += Number(currentValue[key]);
	})
	return accumulator
}, sums)

arrayTable = [["Register change", "Number of places"]]
Object.keys(result).forEach(function(key) {
	arrayTable.push([key.replace("-", "&ndash;"), result[key]])
})

htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplateTableOnly, "queensland", heading, index+1000, htmlTable.thead, htmlTable.tbody))


//##################################################################
// for each region a column chart


results.data.forEach(function(record) {
	heading = "Number of places on the heritage register in " + record.LGA
	arrayTable = [["Year", "Number of places"]]
	var sum = 0
	keys.forEach(function(key) {
		if (record[key] != null) {
			arrayTable.push([key, record[key]]);
			sum += record[key]
		}
	})

	htmlTable = tableToHtml(arrayTable, false)

	if (sum > 0) {
		print(String.format(regionInfoTemplate, record.LGA.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody))
		chartData.push({ options: options, data: arrayTable })
	} else {
		print(String.format(regionInfoTemplateTableOnly, record.LGA.toKebabCase(), heading, index+1000, htmlTable.thead, htmlTable.tbody))
	}


	// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
	// 4. and for each region a simple table

	heading = String.format("Number of places entered, removed and merged from the heritage register in {0}, {1}", 
		record.LGA, endKeys[0].split(" ")[1].replace("-", "&ndash;"))

	arrayTable = [["Register change", "Number of places"]]
	endKeys.forEach(function(key) {
		arrayTable.push([key.replace("-", "&ndash;"), record[key]])
	})

	htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplateTableOnly, record.LGA.toKebabCase(), heading, index+1000, htmlTable.thead, htmlTable.tbody))

})


print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");