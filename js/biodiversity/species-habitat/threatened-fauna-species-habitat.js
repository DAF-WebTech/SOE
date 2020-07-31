"use strict"

if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

var results = Papa.parse(
	csv,
	{
		dynamicTyping: true,
		header: true,
		skipEmptyLines: true
	}
)

var bioregions = {}
var groups = []
results.data.forEach(function (record) {
	if (!bioregions[record.Region]) {
		bioregions[record.Region] = {}
	}
	bioregions[record.Region][record.Group] = record;

	if (groups.indexOf(record.Group) == -1) {
		groups.push(record.Group)
	}
})

var yearKeys = results.meta.fields.slice(3)
var latestYear = yearKeys[yearKeys.length - 1]
var index = 0
var chartData = []

Object.keys(bioregions).forEach(function (bioregionName) {
	var bioregion = bioregions[bioregionName]

	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// table 1 preclear and remnant column
	if (bioregionName == "Queensland") {
		var heading = String.format("Area of Queensland pre-clear threatened fauna habitat and {0} remnant habitat by species group", latestYear)
	}
	else {
		var heading = String.format("Area of pre-clear threatened fauna habitat and {0} remnant habitat by species group in the {1}", latestYear, bioregionName)
	}

	var arrayTable = [["Fauna Group", "Pre-clear", "Remnant"]]

	groups.forEach(function (group) {
		var record = bioregion[group]
		arrayTable.push([
			group,
			record["Pre-clear"],
			record[latestYear]
		])
	})

	var htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, bioregionName.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody))

	var options = getDefaultColumnChartOptions()
	options.hAxis.title = "Fauna Group"
	options.vAxis.format = "short"
	options.vAxis.title = "Hectares"
	chartData.push({ data: arrayTable, type: "column", options: options })


	//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
	// table 2 proportion remnant and non-remnant
	if (bioregionName == "Queensland") {
		heading = String.format("Proportion of Queensland pre-clear threatened fauna habitat that is remnant and non-remnant habitat, {0}", latestYear)
	}
	else {
		heading = String.format("Proportion of pre-clear threatened fauna habitat that is remnant and non-remnant habitat in the {0}, {1}", bioregionName, latestYear)
	}

	arrayTable = [["Fauna Group", "Remnant", "Non-remnant"]]
	groups.forEach(function (group) {
		var record = bioregion[group]
		arrayTable.push([group, record[latestYear], record["Pre-clear"] - record[latestYear]])
	})

	htmlTable = tableToHtml(arrayTable, false)
	print(String.format(regionInfoTemplate, bioregionName.toKebabCase(), heading, index++, htmlTable.thead, htmlTable.tbody))

	options = getDefaultColumnChartOptions()
	options.hAxis.title = "Fauna Group"
	options.isStacked = "percent"
	options.vAxis.title = "Proportion"

	chartData.push({ data: arrayTable, type: "column", options: options })


	//////////////////////////////////////////////////////////////////////
	// checkboxes for each group

	var html = String.format(
		"<div class=\"region-info region-{0} checkbox-panel\"> \
	<h3>Choose Fauna Group to see habitat numbers:</h3> \
	<ul class=checkbox-list>", bioregionName.toKebabCase())

	groups.forEach(function (group, i) {
		html += String.format(
			"<li><input type=checkbox id=checkbox_{0}_{1} class=checkbox-subregion data-region={0} data-group={1} {2}> \
			<label for=checkbox_{0}_{1}>{1}</label>", bioregionName.toKebabCase(), group, (i==0 ? "checked" : ""))
	})

	html += "</ul></div>"
	print(html)

	print(String.format("<div class=\"region-info region-{0}\">", bioregionName.toKebabCase()))
	groups.forEach(function (group) {

		var record = bioregion[group]

		print(String.format("<div class=\"group-info group-{0}\">", group.toKebabCase()))

		//##############################################
		// line chart for group in region
		var heading = String.format("Trend in threatened {0} habitat ", group.toLowerCase())
		if (bioregionName != "Queensland") {
			heading += "in the " + bioregionName
		}

		arrayTable = [["Year", "Habitat (hectares)"]]
		var sum = 0
		yearKeys.forEach(function (year) {
			arrayTable.push([year, record[year]])
			sum += record[year]
		})

		htmlTable = tableToHtml(arrayTable, false)
		if (sum == 0) {
			print(String.format(tableOnlyInner, heading, index + 1000, htmlTable.thead, htmlTable.tbody))
		}
		else {
			print(String.format(tableChartInner, heading, index++, htmlTable.thead, htmlTable.tbody))
			options = getDefaultLineChartOptions()
			options.vAxis.format = "short"
			options.vAxis.title = "Hectares"
			chartData.push({ data: arrayTable, type: "line", options: options })
		}
		
		print("</div>")
		
		if (bioregionName == "Queensland") {

			print(String.format("<div class=\"group-info group-{0}\">", group.toKebabCase()))
			
			//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
			// pie chart to show each region
			heading = String.format("Proportion of pre-clear threatened {0} habitat by bioregion", group.toLowerCase())
			arrayTable = [["Region", "Pre-clear"]]
			Object.keys(bioregions).forEach(function (bkey) {
				if (bkey != "Queensland")
					arrayTable.push([bkey, bioregions[bkey][group]["Pre-clear"]]);
			})
			htmlTable = tableToHtml(arrayTable, false)
			print(String.format(tableChartInner, heading, index++, htmlTable.thead, htmlTable.tbody))

			options = getDefaultPieChartOptions()
			options.colors = thirteenChartColors
			chartData.push({ data: arrayTable, type: "pie", options: options })

			print("</div>")

		}


	})

	print("</div>")


})



print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>")