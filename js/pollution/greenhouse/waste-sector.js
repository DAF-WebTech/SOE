var result = Papa.parse("%globals_asset_file_contents:1455662^replace:\r\n:\\n%", { header: true, dynamicTyping: true, skipEmptyLines: true});
var yearKeys = result.meta.fields.slice(1);
var html = [];
html.push("<script id=jsonheadings type=application/json>");
html.push(JSON.stringify(yearKeys));
html.push("</" + "script>");

html.push("<script id=jsondata type=application/json>");
var categories = [];
result.data.forEach(function(record) {
		 if (record.Category == "Total")
				 return;
		 var newCategory = {name: record.Category.trim(), values: {}};
		 yearKeys.forEach(function(year) {
				 newCategory.values[year] = record[year]; 
		 });
		 categories.push(newCategory);
});
html.push(JSON.stringify(categories));
html.push("</" + "script>");

var totals = result.data[result.data.length-1];
delete totals.Category;
html.push("<script id=jsontotals type=application/json>");
html.push(JSON.stringify(totals));
html.push("</" + "script>");

print (html.join("\n"));