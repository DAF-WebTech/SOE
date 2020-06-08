if (typeof csv == "undefined") {
	var csv = '%frontend_asset_metadata_data-file^as_asset:asset_file_contents^replace:\r\n:\\n%';
}

try {
	var result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true});
} catch(e) {
	print (e.name, e.message, e.toString());
}

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// chart 1 is qld., 
var heading = "Change in number of fragmentation classes";



print("<script id=chartData type=application/json>" + JSON.stringify(chartData) + "</" + "script>");

