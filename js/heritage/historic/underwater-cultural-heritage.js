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
var options = getDefaultColumnChartOptions()
options.isStacked = true

var years = {}
results.data.forEach(function(record) {
	if (!years[record.Year]) {
		years[record.Year] = []
	}
	years[record.Year].push(record);
})

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// 1. 
var heading = "Queensland underwater cultural heritage entries updated in the ANSDB"

var arrayTable = []
Object.keys(years).forEach(function(year) {
	var item = [year]
	var records = years[year]
	records.forEach(function(record) {
		item.push(record["Updates to existing entries"])
	})
	arrayTable.push(item)
})

arrayTable.unshift(["Year", "Shipwreck", "Aircraft wreck", "Artefacts"])

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody))

chartData.push({ options: options, data: arrayTable })


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. same but use different column

heading = "Queensland underwater cultural heritage entries added to the ANSDB"

arrayTable = []
Object.keys(years).forEach(function(year) {
	var item = [year]
	var records = years[year]
	records.forEach(function(record) {
		item.push(record["New entries"])
	})
	arrayTable.push(item)
})

arrayTable.unshift([
	{label: "Year", type: "string"}, 
	{label: "Shipwreck", type:"number"},
	{label: "Aircraft wreck", type: "number"},
	{label: "Artefacts", type: "number"}
])

htmlTable = tableToHtml(arrayTable, false)
//print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody))

//chartData.push({ options: options, data: arrayTable })




print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");