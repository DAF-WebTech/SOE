if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%'
}

var results = Papa.parse(
	csv,
	{
		skipEmptyLines: true,
		//dynamicTyping: true,
		header: true
	}
)


var index = 0

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//1. Pie chart for qld
var heading = "Proportion of local heritage places on local heritage registers by local government area (LGA), 2020"

var arrayTable = []
var data = results.data.forEach(function(record) {
	var val = Number(record[results.meta.fields[results.meta.fields.length - 1]])
	if (val > 0)
		arrayTable.push([record.LGA, val])
})

arrayTable.sort(function(a, b) {
	return a[1] < b[1] ? 1 : -1
})

arrayTable.unshift(["LGA", "Local heritage places identified in a local heritage register"])

var htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplate, "queensland", heading, index++, htmlTable.thead, htmlTable.tbody))

var options = getDefaultPieChartOptions()
options.colors = thirteenChartColors.slice(0, arrayTable.length)
var chartData = [{ options: options, data: arrayTable }]


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// 2. table only, same as data file, but sort by first field
heading = "Number of local heritage places on local heritage registers by local government area (LGA), 2020"

arrayTable = results.data.map(function(record) {
	return [record[results.meta.fields[0]].replace("-", "–"), record[results.meta.fields[2]], record[results.meta.fields[3]], record[results.meta.fields[4]]]
})
arrayTable.sort(function(a, b) {
	return Number(a[1]) < Number(b[1]) ? 1 : -1
})

var head = [results.meta.fields[1]].concat(results.meta.fields.slice(2))
arrayTable.unshift(head)

htmlTable = tableToHtml(arrayTable, false)
print(String.format(regionInfoTemplateTableOnly, "queensland", heading, 1000+index, htmlTable.thead, htmlTable.tbody, null, null, null, "<p><em>LGAs can occur multiple times in the table if they operate under more than one planning scheme</em>"))



//###############################################################
// 3. same table per region
var groups = {}
results.data.forEach(function(record) {
	if (!groups[record.LGA]) {
		groups[record.LGA] = []
	}
	groups[record.LGA].push(record)
})

Object.keys(groups).forEach(function(lga) {

	heading = "Local heritage places and areas by planning scheme in " + lga.replace("-", "–")
	arrayTable = [["Planning Scheme"].concat(results.meta.fields.slice(2))]
	groups[lga].forEach(function(record) {
		arrayTable.push([record[results.meta.fields[1]].replace("-", "–"), record[results.meta.fields[2]], record[results.meta.fields[3]], record[results.meta.fields[4]]])
	})
	
	htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplateTableOnly, lga.toKebabCase(), heading, 1000+index, htmlTable.thead, htmlTable.tbody))
	

})




print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>")