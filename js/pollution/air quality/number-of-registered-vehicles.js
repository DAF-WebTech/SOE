var result = Papa.parse("%globals_asset_file_contents:1468648^replace:\r\n:\\n%", { header: true, dynamicTyping: true, skipEmptyLines: true});

// this is the base object that will be written out to the page in a script tag
var mydata = {
	yearKeys: result.meta.fields.slice(2),
	yearTotals: {},
	latestYear: result.meta.fields[result.meta.fields.length - 1],
	vehicleTypes: [], // just the names
	vehicles: [],
	fuelTypes: [], // just the names
	fuels: [],
	totalRegistrations: 0
};





// some initialisations
mydata.yearKeys.forEach(function (yk) {
	mydata.yearTotals[yk] = 0;
});

// nulls mean 0 in for this data
result.data.forEach(function (d) {
	mydata.yearKeys.forEach(function (yk) {
		if (d[yk] == null)
			d[yk] = 0;
		mydata.totalRegistrations += d[yk];
	});
});

// get the vehicle type names
result.data.forEach(function (row) {
	if (mydata.vehicleTypes.indexOf(row["Vehicle Type"]) == -1) {
		mydata.vehicleTypes.push(row["Vehicle Type"]);
	}
	// we can also calculate year totals here
	mydata.yearKeys.forEach(function (yk) {
		mydata.yearTotals[yk] += row[yk];
	});

	//and populate our fuel type names
	if (mydata.fuelTypes.indexOf(row["Fuel Type"]) == -1)
		mydata.fuelTypes.push(row["Fuel Type"]);
});


mydata.vehicleTypes.forEach(function (vt) {
	var vehicle = {
		name: vt,
		yearTotals: {},
		fuelTypes: [],
		fuels: []
	};
	// get the records we have for this vehicle type

	// initialise year totals
	mydata.yearKeys.forEach(function (y) {
		vehicle.yearTotals[y] = 0;
	});

	// get our fuel types for this vehicle
	var fuelTypeRecords = result.data.filter(function (record) {
		return record["Vehicle Type"] == vt;
	});

	// each record is a fuel type to add to our vehicle
	var latestYearRegistrations = 0;
	var latestYearElectricRegistrations = 0;
	fuelTypeRecords.forEach(function (record) {
		vehicle.fuelTypes.push(record["Fuel Type"]);
		var fuel = { name: record["Fuel Type"] };
		mydata.yearKeys.forEach(function (yk) {
			fuel[yk] = record[yk];
		});
		// calculate registrations for latest year, used by chart 0
		latestYearRegistrations += record[mydata.latestYear];
		if (record["Fuel Type"].indexOf("lectric") > -1)
			latestYearElectricRegistrations += record[mydata.latestYear];

		mydata.yearKeys.forEach(function (y) {
			vehicle.yearTotals[y] += record[y];
		});
		vehicle.fuels.push(fuel);

	});
	vehicle.latest = latestYearRegistrations;
	vehicle.latestElectric = latestYearElectricRegistrations;

	mydata.vehicles.push(vehicle);
});

// calculate a fuel types group
mydata.fuelTypes.sort();
mydata.fuelTypes.forEach(function (ft) {
	var fuel = { name: ft, yearTotals: {} };
	var vehicles = result.data.filter(function (record) {
		return record["Fuel Type"] == ft;
	});

	vehicles.forEach(function (record) {
		mydata.yearKeys.forEach(function (yk) {
			if (!fuel.yearTotals[yk])
				fuel.yearTotals[yk] = 0;
			fuel.yearTotals[yk] += record[yk];
		});

	});

	mydata.fuels.push(fuel);
});


// now we print our tables to the page

var template = "\
<div class=\"region-info region-{0}\" {6}>\
	<h4>{1}</h4>\
	<ul class=chart-tabs data-index={2}>\
	    <li class=active><span>Chart</span>\
	    <li><span>Table</span>\
	</ul>\
	<div class=chart-table>\
		<div id=chart_{2} class=chart></div>\
		<div id=table_{2} class=\"responsive-table sticky inactive\">\
			<table class=\"indicators zebra\">\
				<thead><tr>{3}\
				<tbody>{4}\
				{5}\
			</table>\
		</div>\
	</div>\
</div>"; 
// key:
// {0} region, used for hide/show on map items
// {1} heading
// {2} 0-based index of chart/table div being added
// {3} table head ths
// {4} table body rows
// {5} table footer often not used.
// {6} extra region attribute


var counter = 0; // incremented for each table/chart
var region = "queensland"; // for all table/chart in this page



// ========================================================================================

//table 0 (first in order) is the pie chart

var heading = "Proportion of vehicle registrations in " + mydata.latestYear;
var thead = "<th scope=col>Vehicle Type<th scope=col class=num>Registrations";
var tbody = "";
mydata.vehicles.forEach(function(v) {
	tbody += String.format("<tr><th scope=row>{0}<td class=num>{1}", v.name, v.latest.toLocaleString());
});
var tfoot = "<tfoot><tr><th>Total<th class=num>" + mydata.totalRegistrations.toLocaleString();
var table = String.format(template, region, heading, counter, thead, tbody, tfoot);

print(table); 


// chart 0

var chartData = [];



var chart0 = [["Vehicle type", "Registrations"]];
mydata.vehicles.forEach(function (v) {
	chart0.push([v.name, v.latest]);
});
var pieOptions = getDefaultPieChartOptions();
pieOptions.sliceVisibilityThreshold = 0;
chartData.push({
    data: chart0, 
    chartType: "pie", 
    chartOptions: pieOptions});



//==================================================================

// table 1 (second in order) percentages per year
++counter;
heading = "Proportion (%) of registered vehicles by type";
thead = "<th scope=col>Vehicle Type";
mydata.yearKeys.forEach(function(yk) {
	thead += "<th scope=col class=num>" + yk;
});
tbody = "";
mydata.vehicles.forEach(function(v) {
	tbody += "<tr><th scope=row>" + v.name;
	mydata.yearKeys.forEach(function(yk) {
		tbody += "<td class=num>" + (v.yearTotals[yk] / mydata.yearTotals[yk] * 100).toFixed(2);
	});
});
tfoot = "<tfoot><tr><th>Total";
mydata.yearKeys.forEach(function(yk) {
		tfoot += "<th class=num>100.00";
});
table = String.format(template, region, heading, counter, thead, tbody, tfoot);
print(table); 



// chart  1 (second in order) is the multi line showing percentages per year
var chart1 = [];
mydata.yearKeys.forEach(function (yk) {
	var chartItem = [yk];
	mydata.vehicles.forEach(function (v) {
		chartItem.push(v.yearTotals[yk] / mydata.yearTotals[yk] * 100);
	});
	chart1.push(chartItem);
});

var chartHead = mydata.vehicleTypes.slice();
chartHead.unshift({ label: "Date", type: "string" });
chart1.unshift(chartHead);

var chartOptions = getDefaultLineChartOptions();
chartOptions.vAxis.title = "Registered Vehicles (%)";
chartOptions.pointSize = 0;
chartData.push({
    data: chart1, 
    chartType: "line", 
    chartOptions: chartOptions
});



//=======================================================================================

++counter;
// table 2 (third in order) vehicles by type
heading = "Number of registered vehicles by vehicle type";
thead = "<th scope=col>Vehicle Type";
mydata.yearKeys.forEach(function(yk) {
	thead += "<th scope=col class=num>" + yk;
});
tbody = "";
mydata.vehicles.forEach(function(v) {
	tbody += "<tr><th scope=row>" + v.name;
	mydata.yearKeys.forEach(function(yk) {
		tbody += "<td class=num>" + v.yearTotals[yk].toLocaleString();
	});
});
tfoot = "<tfoot><tr><th>Total";
mydata.yearKeys.forEach(function(yk) {
		tfoot += "<th class=num>" + mydata.yearTotals[yk].toLocaleString();
});
table = String.format(template, region, heading, counter, thead, tbody, tfoot);
print(table); 

// chart 2 (third in order) is the stacked bar showing totals per year
// same data as above without the manipulation for percentage
chart2 = [];
mydata.yearKeys.forEach(function (yk) {
	var chartItem = [yk];
	mydata.vehicles.forEach(function (v) {
		chartItem.push(v.yearTotals[yk]);
	});
	chart2.push(chartItem);
});

chart2.unshift(chartHead);

chartOptions = getDefaultColumnChartOptions();
chartOptions.vAxis.title = "Registrations";
chartOptions.isStacked = true;
chartData.push({
    data: chart2, 
    chartType: "column", 
    chartOptions: chartOptions
});


//==============================================================================

++counter;
// table 3 (fourth in order) vehicles by type
heading = "Proportion of electrified vehicle registrations in " + mydata.latestYear;
thead = "<th scope=col>Vehicle Type<th scope=col class=num>Electrified Vehicle Registrations";
tbody = "";
var totalElectric = 0;
mydata.vehicles.forEach(function(v) {
	tbody += String.format("<tr><th scope=row>{0}<td class=num>{1}", v.name, v.latestElectric.toLocaleString());
	totalElectric += v.latestElectric;
});
tfoot = "<tfoot><tr><th>Total<th class=num>" + totalElectric.toLocaleString();
table = String.format(template, region, heading, counter, thead, tbody, tfoot);
print(table); 


// chart  3 (fourth in order) is  pie chart showing electric, same as chart 0
var chart3 = [[{ label: "Vehicle type" }, { label: "Electrified Vehicle Registrations" }]];
mydata.vehicles.forEach(function (v) {
	chart3.push([v.name, v.latestElectric]);
});

chartOptions = getDefaultPieChartOptions();
chartOptions.sliceVisibilityThreshold = 0;
chartData.push({
    data: chart3, 
    chartType: "pie", 
    chartOptions: chartOptions
});

//=========================================================================

++counter;
// table 4 (fifth in order) vehicles by fuel type
heading = "Number of registered vehicles by fuel type";
thead = "<th scope=col>Fuel Type";
mydata.yearKeys.forEach(function(yk) {
	thead += "<th class=num>" + yk;
});
tbody = "";
mydata.fuels.forEach(function(f) {
	tbody += "<tr><th scope=row>" + f.name;
	mydata.yearKeys.forEach(function(yk) {
		tbody += "<td class=num>" + f.yearTotals[yk].toLocaleString();
	});
});
tfoot = "<tfoot><tr><th>Total";
mydata.yearKeys.forEach(function(yk) {
	tfoot += "<th class=num>" + mydata.yearTotals[yk].toLocaleString();
});
table = String.format(template, region, heading, counter, thead, tbody, tfoot);
print(table); 


// chart  4 (fifth in order) is a stacked bar showing totals per year by fuel type
var chart4 = [];
mydata.yearKeys.forEach(function (yk) {
	var chartItem = [yk];
	mydata.fuels.forEach(function (f) {
		chartItem.push(f.yearTotals[yk]);
	});
	chart4.push(chartItem);
});

chartHead = mydata.fuelTypes.slice(0);
chartHead.unshift("Date");
chart4.unshift(chartHead);

chartOptions = getDefaultColumnChartOptions();
chartOptions.vAxis.title = "Registrations";
chartOptions.isStacked = true;
chartData.push({
    data: chart4, 
    chartType: "column", 
    chartOptions: chartOptions
});


// radio list for chart/table 5 (sixth in order
var list = "\n<h3>Choose vehicle types to break down registrations by fuel type</h3>\n<ul class=subFindingCheckBox id=checkboxlist>";
var checkboxen = "";
mydata.vehicleTypes.forEach(function(vt) {
	checkboxen += String.format("\n<li><input type=checkbox value={1} id={1}_checkbox onchange=\"showhidechart(this)\" {2} /><label for={1}_checkbox>{0}</label>", vt, getSmallName(vt), (vt == "Cars" ? "checked" : ""));
});
list += checkboxen;
list += "</ul>\n";

print(list);


//=========================================================================


// table 5  (sixth in order) vehicles by fuel type
// which is really multiple charts 
thead = "<th scope=col>Fuel Type"; // same for each chart
mydata.yearKeys.forEach(function(yk) {
	thead += "<th class=num>" + yk;
});
chartOptions = getDefaultLineChartOptions();
chartOptions.vAxis.title = "Registrations";


mydata.vehicles.forEach(function(v) { // one chart per vehicle
    ++counter;
    var region = getSmallName(v.name);
    var heading = String.format("Registrations of {0} by fuel type", v.name);
    
    tbody = "";
    v.fuels.forEach(function(f) {
        var tr = String.format("<tr><th scope=row>{0}", f.name);
        mydata.yearKeys.forEach(function(y) {
            tr += "<td class=num>" + f[y].toLocaleString();
        });
        tbody += tr;
    });
    var tfoot = "<tfoot><tr><th>Total";
    mydata.yearKeys.forEach(function(y) {
        tfoot += "<th class=num>" + v.yearTotals[y].toLocaleString();
    });
    

    table = String.format(template, region, heading, counter, thead, tbody, tfoot, v.name == "Cars" ? "" : "style=\"display: none\"");
    print(table);
    
    
    var chart5 = [];
    mydata.yearKeys.forEach(function(yk) {
    	var chartItem = [yk];
    	v.fuels.forEach(function (f) {
    		chartItem.push(f[yk]);
    	});
    	chart5.push(chartItem);
    });
    
    chartHead = v.fuelTypes.slice(0);
    chartHead.unshift({ label: "Date", type: "string" });
    chart5.unshift(chartHead);
    
    chartData.push({
        data: chart5, 
        chartType: "line", 
        chartOptions: chartOptions,
        name: getSmallName(v.name)
    });
/**/

});


// write the chart data to the page
print("\n<script id=jsonchartdata type=application/json>" + JSON.stringify(chartData) + "</" + "script>"); 
 

function getSmallName(s) {
    return s.toLowerCase().replace(/( |\/)/g, "-");
}
