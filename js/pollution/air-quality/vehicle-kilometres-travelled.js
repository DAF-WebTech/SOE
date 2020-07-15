var result = Papa.parse("%globals_asset_file_contents:1468648%", { header: true, dynamicTyping: true, skipEmptyLines: true});
var yearKeys = result.meta.fields.slice(2);
var html = [];
html.push("<script id=jsonheadings type=application/json>");
html.push(JSON.stringify(yearKeys));
html.push("</" + "script>");

html.push("<script id=jsondata type=application/json>");
var vehicles = {};
result.data.forEach(function(record) {
		var vehicleType = record["Vehicle Type"];
		if (! vehicles[vehicleType])
				vehicles[vehicleType] = {};
		var fuelType = record["Fuel Type"];
		if (!vehicles[vehicleType][fuelType])
				vehicles[vehicleType][fuelType] = [];
		
		yearKeys.forEach(function(year){
			 vehicles[vehicleType][fuelType].push({year: year, value: record[year]}); 
		});

});
html.push(JSON.stringify(vehicles));
html.push("</" + "script>");

print (html.join("\n"));