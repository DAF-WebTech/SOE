// various helper functions for JS libraries and the DOM
"use strict";

String.format = function (format, args) {
	var result = '';

	for (var i = 0; ;) {
		var open = format.indexOf('{', i);
		var close = format.indexOf('}', i);
		if ((open < 0) && (close < 0)) {
			result += format.slice(i);
			break;
		}
		if ((close > 0) && ((close < open) || (open < 0))) {
			if (format.charAt(close + 1) !== '}') {
				throw 'The format string contains an unmatched opening or closing brace.';
			}
			result += format.slice(i, close + 1);
			i = close + 2;
			continue;
		}
		result += format.slice(i, open);
		i = open + 1;
		if (format.charAt(i) === '{') {
			result += '{';
			i++;
			continue;
		}
		if (close < 0)
			throw 'The format string contains an unmatched opening or closing brace.';
		var brace = format.substring(i, close);
		var colonIndex = brace.indexOf(':');
		var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10) + 1;
		if (isNaN(argNumber))
			throw 'The format string is invalid.';
		var argFormat = (colonIndex < 0) ? '' : brace.substring(colonIndex + 1);
		var arg = arguments[argNumber];
		if (typeof (arg) === "undefined" || arg === null) {
			arg = '';
		}
		if (arg.format) {
			result += arg.format(argFormat);
		}
		else
			result += arg.toString();
		i = close + 1;
	}
	return result;
};


if (!String.prototype.startsWith) {
	String.prototype.startsWith = function (prefix) {
		return (this.substr(0, prefix.length) === prefix);
	};
}

if (!String.prototype.contains) {
	String.prototype.contains = function (value) {
		return this.indexOf(value) >= 0;
	};
}

if (!String.prototype.toKebabCase) {
	String.prototype.toKebabCase = function () {
		var returnValue = this.toLowerCase().replace(/ /g, "-");
		returnValue = returnValue.replace(/\(/g, "");
		returnValue = returnValue.replace(/\)/g, "");
		returnValue = returnValue.replace(/,/g, "");
		returnValue = returnValue.replace(/'/g, "");
		return returnValue;
	};
}

if (!NodeList.prototype.forEach) {
	NodeList.prototype.forEach = function (fn, scope) {
		for (var i = 0, len = this.length; i < len; ++i) {
			fn.call(scope, this[i], i, this);
		}
	}
}


Array.prototype.transpose = function () {
	var ret = [];
	this.forEach(function (row, i) {
		row.forEach(function (cell, i2) {
			if (i == 0)
				ret.push([cell]);
			else
				ret[i2].push(cell);
		});
	});
	return ret;
}


if (typeof Object.assign != 'function') {
	// Must be writable: true, enumerable: false, configurable: true
	Object.defineProperty(Object, "assign", {
		value: function assign(target, varArgs) { // .length of function is 2
			'use strict';
			if (target == null) { // TypeError if undefined or null
				throw new TypeError('Cannot convert undefined or null to object');
			}

			var to = Object(target);

			for (var index = 1; index < arguments.length; index++) {
				var nextSource = arguments[index];

				if (nextSource != null) { // Skip over if undefined or null
					for (var nextKey in nextSource) {
						// Avoid bugs when hasOwnProperty is shadowed
						if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
							to[nextKey] = nextSource[nextKey];
						}
					}
				}
			}
			return to;
		},
		writable: true,
		configurable: true
	});
}

/* New DES style guid says we don't need this any more.
(function () { // this one needs a variable so wrap it in a function invoke
	var proxied = Number.prototype.toLocaleString;
	Number.prototype.toLocaleString = function () {
		if (this.valueOf() < 10000)
			return this.toString();
		else
			return proxied.apply(this);
	};
}());
*/ 
//~ end helpers



// some code to run at startup
document.addEventListener("DOMContentLoaded", function () {

	if (window.location.pathname.indexOf("/heritage/") >= 0) {
		soejs.highlightColour = "#c91c21";
		soejs.highlightColourClickable = "#f7eb6f";
		soejs.fillColour = "#ec2127";
		soejs.regionColour = "#ec2127";
	}
	else if (window.location.pathname.indexOf("/pollution/") >= 0) {
		soejs.highlightColour = "#cf692a";
		soejs.highlightColourClickable = "#f7eb6f";
		soejs.fillColour = "#f47b31";
		soejs.regionColour = "#f47b31";
	}
	else if (window.location.pathname.indexOf("/climate/") >= 0) {
		soejs.highlightColour = "#32478b";
		soejs.highlightColourClickable = "#f7eb6f";
		soejs.fillColour = "#3b53a4";
		soejs.regionColour = "#3b53a4";
	}
	else if (window.location.pathname.indexOf("/liveability/") >= 0) {
		soejs.highlightColour = "#32478b";
		soejs.highlightColourClickable = "#f7eb6f";
		soejs.fillColour = "#82368c";
		soejs.regionColour = "#82368c";
	}

	soejs.clickable = document.querySelectorAll(".regiontabs").length > 0;
	soejs.highlight_colour = soejs.clickable ? soejs.highlightColourClickable : soejs.highlightColour;

	const toggleTabState = function(e) {
			// click on tab headers, which are the event target
			tabHeaders.forEach(function (myTabHeader) {
				if (myTabHeader == e.currentTarget)
					myTabHeader.classList.add("active");
				else
					myTabHeader.classList.remove("active");
			});
			// swap map/list
			const regionMap = document.getElementById("regionmap")
			const regionLinks = document.getElementById("regionlinks")
			if (e.currentTarget.textContent == "Map") {
				regionMap.classList.remove("inactive");
				regionLinks.classList.add("inactive");
			}
			else { //List 
				regionMap.classList.add("inactive");
				regionLinks.classList.remove("inactive");
			}
	}

	var tabHeaders = document.querySelectorAll("ul.regionlink-tabs li");
	tabHeaders.forEach(function (tabHeader) {
		tabHeader.addEventListener("click", toggleTabState)
		tabHeader.addEventListener("keydown", function(e){
			if (e.keyCode == 13)
				toggleTabState()
		})
	});

	if (window.populateIndicatorCharts) { // it's a finding page
		soejs.loadFindingData(populateIndicatorCharts);

		var regionInfos = document.querySelectorAll(".region-info");
		for (var i = 0; i < regionInfos.length; ++i) {
			if (!regionInfos[i].classList.contains("region-queensland")) {
				soejs.only_qld_flag = false;
				break;
			}
		}

		if (regionInfos.length > 2) { // text and graph

			if (document.querySelectorAll(".chart").length == 0) {
				// Don't need to wait for charts to load, just hide the non Qld sections
				var hideThese = document.querySelectorAll(".region-info:not(.region-queensland)");
				hideThese.forEach(function (div) {
					div.style.display = "none";
				});

				document.querySelector(".regionlinks a").classList.add("current");
			}

			// Watch for region clicks
			document.querySelectorAll(".regionlinks a").forEach(function (a) {
				a.addEventListener("click", function (e) {
					e.preventDefault();

					// Get the selected region from the anchor link
					var selected_region = this.getAttribute("href");
					selected_region = selected_region.substring(1); // remove '#' part of anchor to get class name

					// the select function should have been set with the google.maps.event (on pages js)
					// but sometimes this doesn't happen in time, which is unpredictable
					// and probably a disaster for the page, but we'll see if a setTimeout will help it.
					if (soejs.selectFunction) {
						soejs.selectFunction(selected_region);
					}
					else {
						window.setTimeout(function() {
							try {
								soejs.selectFunction(selected_region);
							} catch(e) {
								console.log("error caught: soejs.selectFunction not set")
								Sentry.captureException(e)

							}
						}, 500)
					}

				});
			});
		}

	}//~ if populateIndicatorCharts

	// make a div to hold a control to add to the map, 
	// so that the satellite image can have an option to not show the regions
	var colourControlDiv = document.createElement("div");
	colourControlDiv.className = "infobox"
	var colourControlCheckbox = document.createElement("input");
	colourControlCheckbox.setAttribute("type", "checkbox");
	colourControlCheckbox.setAttribute("checked", "checked");
	colourControlCheckbox.setAttribute("id", "colourControlCheckbox");
	colourControlCheckbox.addEventListener("change", function () {
		// change the "opacity" of the polygon, 0 means you can see right through it
		soejs.fillOpacity = this.checked ? 0.75 : 0;
		soejs.polygonArray.forEach(function (p) {
			p.set("fillOpacity", soejs.fillOpacity);
		});
	});
	colourControlDiv.appendChild(colourControlCheckbox);
	var colourControlLable = document.createElement("label");
	colourControlLable.setAttribute("for", "colourControlCheckbox");
	colourControlLable.textContent = "Show regions";
	colourControlDiv.appendChild(colourControlLable);

	soejs.colourControl = colourControlDiv;


}); //~ end document ready


// our global to hold all our variables and functions
var soejs = {
	regionTabs: true,
	fetchData: true,
	map: {},
	path: "",
	polygonArray: [],
	last_id_selected: 0,
	highlight_colour: "",
	highlightColour: "#5da23b", // set to biodiversity by default 
	highlightColourClickable: "#f7eb6f",
	fillOpacity: 0.75,
	fillColour: "#6dbe45",
	regionColour: "#6dbe45",
	clickable: false,
	num_charts: 0,
	findingPageData: "",
	num_charts_loaded: 0,
	only_qld_flag: true,
	thisFindingHasRegionTabs: true,
	markers: [],
	infoWindows: [],
	colourControl: {},
	map_bounds: {},
	showRegionColourFlag: false,
	firstHash: false,
	hasDataFile: true,
	chartColors: ["#4285f4", "#db4437", "#f4b400", "#0f9d58", "#ab47bc", "#00acc1", "#ff7043", "#9e9d24", "#5c6bc0", "#f06292", "#00796b", "#c2185b", "#5e97f5"],


	getDefaultColumnChartOptions: function () {
		// these are cut down version, do we need to add anything
		return {
			hAxis: {
				title: "Year", // always need this
				titleTextStyle: { italic: false }
			},
			height: 400,
			showTip: true,
			vAxis: {
				title: "", // always need this
				titleTextStyle: { italic: false }
			},
			width: "100%",
			fontSize: 12,
			fontName: "Lato, sans-serif",
			colors: ["#4285f4", "#db4437", "#f4b400", "#0f9d58", "#ab47bc", "#00acc1", "#ff7043"],
			legend: {}
		};
	},

	getDefaultPieChartOptions: function () {
		return {
			chartArea: {
				width: "80%",
				height: "80%"
			},
			height: 250,
			//is3D: true,
			showTip: true,
			width: "100%",
			fontSize: 12,
			fontName: "Lato, sans-serif",
			colors: ["#4285f4", "#db4437", "#f4b400", "#0f9d58", "#ab47bc", "#00acc1", "#ff7043"],
			sliceVisibilityThreshold: 0
		};
	},

	getDefaultLineChartOptions: function () {
		var retVal = this.getDefaultColumnChartOptions();
		retVal.pointSize = 3;
		return retVal;
	},

	fixDataTableFormat: function (dataTable, factor) //used on finding pages
	{
		if (!factor)
			factor = 1000000;

		var formattedData = dataTable.clone();
		for (var x = 0; x < formattedData.getNumberOfRows(); x++) {
			for (var y = 0; y < formattedData.getNumberOfColumns(); y++) {
				if (y != 0) { // first col is row heading
					var dataPoint = formattedData.getValue(x, y);
					if (dataPoint != null) {
						formattedData.setValue(x, y, dataPoint / factor);
						formattedData.setFormattedValue(x, y, dataPoint.toString());
					} else {
						formattedData.setValue(x, y, dataPoint);
					}
				}
			}
		}
		return formattedData;
	},

	mapLoadError: function () {
		document.querySelectorAll("ul.regionlink-tabs li").forEach(function (li) {
			li.classList.toggle("active");
		});
		document.getElementById("regionmap").classList.add("inactive");
		document.getElementById("regionlinks").classList.remove("inactive");
	},

	initialisePoly: function () {

		soejs.selectFunction = soejs.selectPolyRegion;

		var mapCanvas = document.getElementById('map-canvas');
		if (!mapCanvas)
			return; //no map

		if (!soejs.thisFindingHasRegionTabs)
			return; // not all finding pages have region maps

		// we found that occasionally, unreliably, and we couldn't reproduce it
		// loading the charts library somehow knocked out google maps
		// so we'll bypass all this code if it's not loaded
		if (!google.maps) {
			soejs.mapLoadError();
			return;
		}

		var default_center = new google.maps.LatLng(-19.5, 145.75);
		var bounds = new google.maps.LatLngBounds();
		var location_code = document.getElementById("location_code").value; //encoded polygon
		var location_name = document.getElementById("location_name").value; //region name
		var latitude = document.getElementById("latitude").value;
		var longitude = document.getElementById("longitude").value;

		// define zoom for the spatial filter
		var mapOptions = {
			zoom: 6,
			center: default_center,
			draggable: true,
			mapTypeControl: true,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
			},
			streetViewControl: false,
			zoomControl: true,
			scrollwheel: false
		};
		soejs.map = new google.maps.Map(mapCanvas, mapOptions);

		for (var i = 0; i < polyArray.length; i++) {
			// where encoding includes more than one polygon, QGIS separates them with a <br> tag so we need to split on it to ensure the <br> is not considered when decoding

			var multiPoly = String(polyArray[i][location_code]).split("<br>"); //the array position of encoding may change depending on the layer's order of attributes
			var region_name = polyArray[i][location_name]; // this will change depending on the dataset
			var region_code = 'region-' + soejs.codify(String(region_name));
			var info_content = region_name;
			var region_lat = polyArray[i][latitude];
			var region_long = polyArray[i][longitude];


			for (var j = 0; j < multiPoly.length; j++) {
				var decodedPath = google.maps.geometry.encoding.decodePath(String(multiPoly[j]));

				var setRegion = new google.maps.Polygon({
					path: decodedPath,
					clickable: true,
					strokeColor: "#CDCDCD",
					fillColor: soejs.fillColour,
					fillOpacity: soejs.fillOpacity,
					strokeOpacity: 0.5,
					strokeWeight: 1.0,
					map: soejs.map,
					regionname: region_name,
					label: region_name,
					regionlat: region_lat,
					regionlong: region_long,
					regioncolor: soejs.regionColour,
					id: region_code
				});

				// If no info to show set cursor to default
				if (!soejs.clickable) {
					setRegion.set("cursor", "default");
				}

				// Add to global array of polygon elements
				soejs.polygonArray.push(setRegion);

				// Watch for hovering over region
				google.maps.event.addListener(setRegion, "mouseover", function (event) {
					soejs.showSelectedRegion(this.id, this.regionname);
				});

				// Watch for hovering out of region
				google.maps.event.addListener(setRegion, "mouseout", function (event) {
					if (soejs.last_id_selected) {
						soejs.selectPolyRegion(soejs.last_id_selected);
					}
				});


				// Watch for clicking on region
				google.maps.event.addListener(setRegion, 'click', function (event) {
					if (document.querySelectorAll("." + this.id).length || location.href.indexOf("/about/search") >= 0) {
						soejs.showSelectedRegion(this.id, this.regionname);
						soejs.showHideRegionInfo(this.id);
						soejs.last_id_selected = this.id;
					}
				});

				// Expand the map viewport extent to include all polygons
				// compatible with IE8
				for (var k = 0; k < decodedPath.length; k++) {
					soejs.path += decodedPath[k];
					bounds.extend(decodedPath[k]);
				}
			}
		}
		soejs.map.fitBounds(bounds);
		var listener = google.maps.event.addListener(soejs.map, "idle", function () {
			soejs.map.fitBounds(bounds);
			if (soejs.map.getZoom() > 10) {
				soejs.map.setZoom(10);
			}
			google.maps.event.removeListener(listener);
		});


		// bounds of the desired area
		var allowedBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(-31, 137),
			new google.maps.LatLng(-10, 155)
		);
		var lastValidCenter = soejs.map.getCenter();

		google.maps.event.addListener(soejs.map, 'center_changed', function () {
			if (allowedBounds.contains(soejs.map.getCenter())) {
				// still within valid bounds, so save the last valid position
				lastValidCenter = soejs.map.getCenter();
				return;
			}
			// not valid anymore => return to last valid position
			soejs.map.panTo(lastValidCenter);
		});

		google.maps.event.addListener(soejs.map, "maptypeid_changed", function () {
			if (soejs.map.mapTypeId == "satellite" || soejs.map.mapTypeId == "hybrid") {
				if (!soejs.showRegionColourFlag) {
					soejs.map.controls[google.maps.ControlPosition.TOP_CENTER].push(soejs.colourControl);
					soejs.showRegionColourFlag = true;
				}
			}
			else {
				try {
					soejs.map.controls[google.maps.ControlPosition.TOP_CENTER].pop(soejs.colourControl);
				} catch(e) {
					console.log("exception caught!", e);
				}
				soejs.fillOpacity = 0.75;
				soejs.showRegionColourFlag = false;
			}
			soejs.polygonArray.forEach(function (p) {
				p.set("fillOpacity", soejs.fillOpacity);
			});

		});

	},//~ initialise

	initialisePin: function () {

		soejs.selectFunction = soejs.selectPinRegion;

		// we found that occasionally, unreliably, and we couldn't reproduce it
		// loading the charts library somehow knocked out google maps
		// so we'll bypass all this code if it's not loaded
		if (!google.maps) {
			soejs.mapLoadError();
			return;
		}

		var infowindow = new google.maps.InfoWindow();
		var centre_latlng = new google.maps.LatLng(-21, 146);
		var mapOptions = {
			zoom: 5,
			center: centre_latlng,
			draggable: true,
			streetViewControl: false,
			zoomControl: true,
			zoomControlOptions: {
				position: google.maps.ControlPosition.TOP_RIGHT
			},
			scrollwheel: false
		};

		//Set the custom map type
		var mapCanvas = document.getElementById('map-canvas');
		if (!mapCanvas)
			return; //no map
		soejs.map = new google.maps.Map(mapCanvas, mapOptions);

		soejs.map_bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < pinLocationArray.length; i++) {
			// data in format:
			var location_id = pinLocationArray[i][0];  // 0: region code
			var location_title = pinLocationArray[i][1];  // 1: title for infowindow
			var location_content = pinLocationArray[i][2];  // 1: content for infowindow
			var location_lat = pinLocationArray[i][3];  // 2: lat
			var location_lng = pinLocationArray[i][4];  // 3: long

			var content = '<div class="infowindow">' + location_content + '</div>';

			var location = new google.maps.LatLng(location_lat, location_lng);

			var thisMarker = new google.maps.Marker({
				position: location,
				draggable: false,
				map: soejs.map,
				title: location_title,
				icon: "./?a=1267015",
				id: 'region-' + location_id,
				html: content
			});
			soejs.map_bounds.extend(location);

			google.maps.event.addListener(thisMarker, 'click', function () {
				if (document.querySelectorAll("." + this.id).length) {
					soejs.showHideRegionInfo(this.id);
				}
				infowindow.setContent(this.html);
				infowindow.open(soejs.map, this);
				soejs.infoWindows.push(infowindow);
			});
			soejs.markers.push(thisMarker);
			soejs.map.fitBounds(soejs.map_bounds);
		}

		var listener = google.maps.event.addListener(soejs.map, "idle", function () {
			soejs.map.fitBounds(soejs.map_bounds);
			google.maps.event.removeListener(listener);
		});

		// bounds of the desired area
		var allowedBounds = new google.maps.LatLngBounds(
			new google.maps.LatLng(-30, 137),
			new google.maps.LatLng(-10, 155)
		);
		var lastValidCenter = soejs.map.getCenter();

		google.maps.event.addListener(soejs.map, 'center_changed', function () {
			if (allowedBounds.contains(soejs.map.getCenter())) {
				// still within valid bounds, so save the last valid position
				lastValidCenter = soejs.map.getCenter();
				return;
			}
			// not valid anymore => return to last valid position
			soejs.map.panTo(lastValidCenter);
		});

	},


	// Function to highlight the region and show the region name
	showSelectedRegion: function (region_code, region_name) {
		// Create an infobox with the name of the selected region
		soejs.map.controls[google.maps.ControlPosition.RIGHT_TOP].clear();
		if (soejs.map.getZoom() == 0) {
			soejs.map.setZoom(6);
		}
		if (region_code !== "region-queensland" && region_code !== undefined) {
			var selectedRegionDiv = document.createElement('div');
			selectedRegionDiv.className = "infobox";
			selectedRegionDiv.innerHTML = region_name;
			soejs.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(selectedRegionDiv);
		}

		// Highlight selected region
		var GBR = ["region-fitzroy-basin-report-card", "region-fitzroy-report-card", 
			"region-mackay-whitsunday-isaac-report-card", "region-gladstone-harbour-report-card", 
			"region-qcatchment-endeavour", "region-qcatchment-jacky-jacky", "region-qcatchment-jeannie", "region-qcatchment-lockhart", "region-qcatchment-normanby", "region-qcatchment-olive-pascoe", "region-qcatchment-stewart", "region-wet-tropics-report-card", "region-qcatchment-burdekin", 
			"region-townsville-dry-tropics-report-card", "region-wet-tropics-waterways-report-card"];

		for (var i = 0; i < soejs.polygonArray.length; i++) {
			soejs.polygonArray[i].set("fillColor", soejs.polygonArray[i].regioncolor); //set to default color of the filter
			if (soejs.polygonArray[i].id == region_code) {
				// highlight the region	
				soejs.polygonArray[i].set("fillColor", soejs.highlight_colour);
			}
			// special handling for GBR area for Water Quality Catchments. should also highlight smaller polygon under GBR for water quality catchments
			if (soejs.polyFilter == "qld-water-quality-catchments-poly-v4.js"
					&& region_code == "region-reef-water-quality-report-card"
					&& GBR.includes(soejs.polygonArray[i].id)) {
				soejs.polygonArray[i].set("fillColor", soejs.highlight_colour);
			}

		}
	}, //~showSelectedRegion


	// function when region has been selected outside the map (i.e. from the list of region links)
	selectPolyRegion: function (region_code) {

		if (region_code === 'region-queensland' || region_code === undefined) {
			// reset to default region (Qld)
			soejs.showSelectedRegion(region_code);
			soejs.showHideRegionInfo(region_code);
		} else {
			if (google.maps) {

				// find the polygon that matches the selected region
				for (var i = 0; i < soejs.polygonArray.length; i++) {
					if (soejs.polygonArray[i].id == region_code) {
						var region_latlng = new google.maps.LatLng(soejs.polygonArray[i].regionlat, soejs.polygonArray[i].regionlong);
						var mev = { stop: null, latLng: region_latlng }
						google.maps.event.trigger(soejs.polygonArray[i], 'click', mev);
						break;
					}
				}
			} else {
				soejs.showHideRegionInfo(region_code);
			}
		}
	},//~selectPolyRegion


	selectPinRegion: function (region_code) {

		if (region_code === 'region-queensland') {
			if (soejs.infoWindows.length > 0)
				soejs.infoWindows[0].close();
			soejs.showHideRegionInfo(region_code);
			soejs.map.fitBounds(soejs.map_bounds);
			soejs.map.setZoom(5);
		} else {
			if (google.maps) {
				//  reset all the icons back to normal except the one you clicked
				for (var i = 0; i < soejs.markers.length; i++) {
					if (soejs.markers[i].id === region_code) {
						google.maps.event.trigger(soejs.markers[i], 'click');
						break;
					}
				}
			}
			else {
				soejs.showHideRegionInfo(region_code);
			}
		}
	},//~selectPinRegion



	codify: function (strvar) {
		var strcode = strvar.replace(/\s/g, '-');
		strcode = strcode.replace(/---/g, '-');
		strcode = strcode.toLowerCase();
		strcode = strcode.replace(/[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\/]/gi, '');
		return strcode;
	},//~ codify


	loadFindingData: function (populateIndicatorChartFunction) {
		if (soejs.hasInlineData) {
			google.charts.setOnLoadCallback(populateIndicatorChartFunction);
		}
		else if (soejs.hasDataFile) {
			var url = String.format("/2020/datasets/indicator-{0}.csv", soejs.resourceId.replace(/\./g, "-"));
			Papa.parse(url, {
				download: true,
				header: true,
				skipEmptyLines: true,
				complete: function (results) {
					soejs.findingPageData = results;
					google.charts.setOnLoadCallback(populateIndicatorChartFunction);
				},
				error: function (error, file) {
					console.log("findLoadingData error: ", url, error, file);
				}
			});
		}
	},//~loadFindingData


	// legacy, from 2015 and 2017
	chartsLoaded: function () {
		soejs.chartsLoaded2();
		return;

		// Called each time a chart is loaded.
		// Checks whether it's the last one to load. If it is, hides all but Qld ones.
		// Need to wait until all are loaded because charts don't draw corectly if hidden.

		soejs.num_charts_loaded++;
		if (soejs.num_charts_loaded == soejs.num_charts) {

			// Highlight Qld/first
			$('.regionlinks a:first').addClass('current');

			/* Add tabs to each chart group (chart/table) */
			$('.chart-table').each(function () {
				var group_num = $(this).attr('id').substr(11); // string after 'region-info-'
				// add the tab nav
				$(this).prepend('<ul><li class="chart"><a href="#chart_' + group_num + '">Chart</a></li><li class="table"><a href="#table_' + group_num + '">Table</a></li></ul>');
				$(this).tabs();

			});


			// i don't know why this is necessary, but the charts with vue and bioregion maps
			// were failing to draw correctly, so this fixed it
			window.setTimeout(function () {

				// Hide all but Qld
				$(".region-info").not(".region-queensland").hide();

				// hide any marked with initial-hide
				$(".initial-hide").hide();

			}, 100);


		}
	}, //~ chartsLoaded


	// this is only for soe 2020, 
	// but also can use chartsLoaded3 if appropriate
	chartsLoaded2: function () {
		// Called each time a chart is loaded.
		// Checks whether it's the last one to load. If it is, hides all but Qld ones.
		// Need to wait until all are loaded because charts don't draw corectly if hidden.

		soejs.num_charts_loaded++;
		if (soejs.num_charts_loaded == soejs.num_charts) {

			// Highlight either queensland or the region in the URL
			var myRegion = window.location.hash || "#region-queensland";
			var regionLink = document.querySelector(String.format("a[href='{0}']", myRegion));
			if (regionLink)
				regionLink.classList.add("current");

			// add our tabs to each chart/table group
			document.querySelectorAll("div.chart-table").forEach(function (chartTable) {
				var indicatorNumber = chartTable.getAttribute("id").split("_")[1];
				var chartGroup = chartTable.parentNode;

				// add list items to be our tab headings
				chartTable.insertAdjacentHTML("beforeBegin", "<ul class=chart-tabs id=chartTabs" + indicatorNumber + "><li class=active><span>Chart</span><li><span>Table</span></ul>");

				var ul = chartGroup.querySelector("ul"); // the one we just inserted
				var listItems = ul.querySelectorAll("li");
				listItems.forEach(function (li) { //add event listener to each li element
					li.addEventListener("click", function () {
						// get each tab heading element, and toggle active class
						listItems.forEach(function (thisItem) {
							thisItem.classList.toggle("active");
						});

						// get the chart and the table, and toggle active class
						chartTable.querySelector("#chart_" + indicatorNumber).classList.toggle("inactive");
						chartTable.querySelector("#table_" + indicatorNumber).classList.toggle("inactive");

					});
				});

				var chartDiv = chartTable.querySelector("div#table_" + indicatorNumber)
				chartDiv.classList.add("inactive"); // chart visible by default
			});

			// i don't know why it became necessary to use window.setTimeout, 
			// but the charts with vue and bioregion maps
			// were failing to draw correctly, so this fixed it
			window.setTimeout(function () {

				// Hide all but queensland or else the region from the URL hash
				myRegion = myRegion.substring(1); // remove leading hash
				document.querySelectorAll(".region-info").forEach(function (region) {
					if (!region.classList.contains(myRegion))
						region.style.display = "none";
				});
				if (soejs.thisFindingHasRegionTabs) {
					// the select function should have been set with the google.maps.event (on pages js)
					// but sometimes this doesn't happen in time, which is unpredictable
					// and probably a disaster for the page, but we'll see if a setTimeout will help it.
					if (soejs.selectFunction) {
						soejs.selectFunction(myRegion);
					}
					else {
						window.setTimeout(function() {
							try {
								soejs.selectFunction(myRegion);
							} catch(e) {
								console.log("error caught: soejs.selectFunction not set")
								Sentry.captureException(e)
							}
						}, 500)
					}
				}

				// hide any marked with initial-hide
				document.querySelectorAll(".initial-hide").forEach(function (region) {
					region.style.display = "none";
				});

			}, 100);

		// do anything else required by the page
		if (soejs.afterCharts)
			soejs.afterCharts();

		} //~ if
	}, //~ chartsLoaded2


	// for 2020 and later, 
	// what it does:
	// 1. hides everything not region-queensland
	// 2. if there's a hash that's a region link in list behind the map, make it active
	// 3. add event listeners to the tabs for chart/table
	// 4. hide all but queensland or region location hash  (not sure how it is different from (1))
	// 5. set the map section if there is location hash region
	// 6. hide anything with special class name "initial-hide" (is this class being used anywhere?)
	//
	// param: checkForLast -- if you have other regions apart from the default "region-queensland", then set this to true, otherwise leave empty
	// this parameter is used when you are doing google.visualization.events.addListener(chart, "ready", soejs.chartsLoaded3);

	chartsLoaded3: function () {

		++soejs.num_charts_loaded;
		if (soejs.num_charts_loaded !== soejs.num_charts)
			return; // else every chart has been loaded, so go ahead

		//1. hides everything not region-queensland
		var hideThese = document.querySelectorAll("div.region-info:not(.region-queensland)");
		hideThese.forEach(function (e) {
			e.style.display = "none";
		});

		// 2. if there's a hash that's a region link in list behind the map, make it active
		var myRegion = window.location.hash || "#region-queensland";
		var regionLink = document.querySelector(String.format("a[href='{0}']", myRegion));
		if (regionLink)
			regionLink.classList.add("current");

		// 3. add event listeners to the tabs for chart/table
		// only two tabs (ie chart and table), so simple toggling of the classes will do
		document.querySelectorAll("ul.chart-tabs").forEach(function (ul) {
			var index = ul.dataset.index;

			var listItems = ul.querySelectorAll("li");

			listItems.forEach(function (li) {

				li.addEventListener("click", function (evt) {
					if (!li.classList.contains("active")) {// don't do anything if they happen to click the tab that's already active
						listItems.forEach(function (li) {
							li.classList.toggle("active"); // toggle active class on each
						});
						// get the chart and the table, and toggle inactive class
						document.getElementById("chart_" + index).classList.toggle("inactive");
						document.getElementById("table_" + index).classList.toggle("inactive");
					}
					evt.stopPropagation();
				});
			});
		});

		// 4. hide all but queensland or region location hash  (not sure how it is different from (1))
		myRegion = myRegion.substring(1); // remove leading hash
		document.querySelectorAll(".region-info").forEach(function (region) {
			if (!region.classList.contains(myRegion))
				region.style.display = "none";
		});

		// 5. set the map section if there is location hash region
		if (soejs.thisFindingHasRegionTabs) {
			// the select function should have been set with the google.maps.event (on pages js)
			// but sometimes this doesn't happen in time, which is unpredictable
			// and probably a disaster for the page, but we'll see if a setTimeout will help it.
			if (soejs.selectFunction) {
				soejs.selectFunction(myRegion);
			}
			else {
				window.setTimeout(function() {
					try {
						soejs.selectFunction(myRegion);
					} catch(e) {
						console.log("error caught: soejs.selectFunction not set")
						Sentry.captureException(e)
					}
				}, 500)
			}
		}

		// 6. hide anything with special class name "initial-hide" (BUT this class being used anywhere?)
		document.querySelectorAll(".initial-hide").forEach(function (region) {
			console.log("chartsLoaded3 has detected div.initial-hide on" + region);
			region.style.display = "none";
		});

		// 7. do anything else required by the page
		if (soejs.afterCharts)
			soejs.afterCharts();


	}, //~ chartsLoaded3



	showHideRegionInfo: function (selected_region) {
		if (soejs.only_qld_flag) {
			return false;
		}

		// Hide all the region infos
		var regionInfos = document.querySelectorAll(".region-info");
		for (var i = 0; i < regionInfos.length; ++i) {
			var regionInfo = regionInfos[i];
			regionInfo.style.display = "none";
		};


		// Check we have a valid region class name (should be 'region-' followed by region code)
		if (selected_region.substr(0, 7) != 'region-') {
			selected_region = 'region-' + selected_region;
		}

		var selectedRegions = document.querySelectorAll("." + selected_region);
		for (var i = 0; i < selectedRegions.length; ++i) {
			selectedRegions[i].style.display = "block";
		};

		soejs.firstHash ? (window.location.hash = selected_region) : (soejs.firstHash = true);


		// Show that this is the selected region
		document.querySelectorAll(".regionlinks a").forEach(function (regionLink) {
			regionLink.classList.remove("current");
		});

		document.querySelector(String.format(".regionlinks a[href='#{0}']", selected_region)).classList.add("current");
	}



};

(function () { // this stuff does not need dom ready

}())
