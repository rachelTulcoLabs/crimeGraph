////////setupMap/////////////
var map = new L.Map('map') //Initialize map
var basemapLayer = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNobGNoYW5nIiwiYSI6IjRlMWI3NDlhYmMxZWVlMzM0ZTM5MDU1M2RmZWZmOTI4In0.GINKorvt3kV6-YnRfH4iLQ');
map.setView([34.0522, -118.2437],11)
map.addLayer(basemapLayer);

var heatMap = new L.Map('heatMap') //Initialize map
var basemap = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNobGNoYW5nIiwiYSI6IjRlMWI3NDlhYmMxZWVlMzM0ZTM5MDU1M2RmZWZmOTI4In0.GINKorvt3kV6-YnRfH4iLQ');
heatMap.setView([34.0522, -118.2437],11)
heatMap.addLayer(basemap);

window.vCodes = ["110", "113", "121", "122", "230", "231", "235", "236", "250", "251", "435", "436", "622", "623", "624", "625", "626", "627", "753", "756"]
window.pCodes = ["210","220","310","320","330","331","341","341","343","345","347","349","350","351","352","353","410","420","421","440","441","442","443","444","445","446","450","451","452","453","470","471","472","473","474","475","480","485","487","510","520","647","648","740","740","745","924","950","951"]

function activityMarker(feature, latlng){ // Point styling
  var circle = {
      radius: 4.5,
      color: getColor(feature.properties.crm_cd),
      weight: 1,
      fillOpacity: 0.65
  };
  return L.circleMarker(latlng, circle)} 

function getColor(a){
  if (window.vCodes.includes(a)){return '#f58538';
  }else if (window.pCodes.includes(a)) {return '#2b6dbc';
  }else{return '#b5b5b5'}}


var updatemenus=[{
        buttons: [
            {args: [{'visible': [true, true, true, true]}],
                label: 'All',
                method: 'update'},
            {args: [{'visible': [true, false, false, true]}],
                label: 'Violent',
                method: 'update'},
            {args: [{'visible': [false, true, false,true]}],
                label: 'Property',
                method: 'update'},
            {args: [{'visible': [false, false, true, true]},
                       //{'annotations': [...low_annotations, ...high_annotations]}
                      ],
                label: 'Other',
                method: 'update'},
        ],
        direction: 'left', pad: {'r': 10, 't': 10}, showactive: true, type: 'buttons', x: 0.1, xanchor: 'left', y: 1.2, yanchor: 'top'}]


var siteList = {};

siteList['JPR'] = [-118.6473534, 34.1367165];
siteList['DSL1'] = [-118.4129786, 34.0290103];
siteList['DSL2'] = [-118.4133437, 34.0291586];
siteList['DSL3'] = [-118.4133437, 34.0294786];
siteList['goshen'] = [-118.4664595, 34.0461236];
siteList['westbrook'] = [-118.4882103, 34.0626995];

var violent = {x: [], y: [], type: 'bar'};
    property = {x: [], y: [], type: 'bar'};
    other = {x: [], y: [], type: 'bar'};
//    all = {x: [], y: [], type: 'bar'};
    data = [violent, property, other];
    layout = { title: 'Crime Types', yaxis: {rangemode: 'tozero', zeroline: true},  barmode: "stack"//, showlegend: false
  };

Plotly.newPlot('idiot', data, layout,{responsive: true});

function viewChange(){
  var dateStart = document.getElementById('dateStart').value+""
      dateEnd = document.getElementById('dateEnd').value+""
  window.site = document.getElementById('siteSelected').value
  console.log(window.site, dateStart, dateEnd)

  window.xAxis = dateDiff(dateStart, dateEnd)
  getData(dateStart, dateEnd)
};

function dateDiff(x,y){
  var a = moment(x)
      b = moment(y)
      d = b.diff(a,'days')
      window.xValue=[]
  for (i = 0; i < d+1; i++){  // getting dates for x axis values
    window.xValue.push(a.format("YYYY-MM-DD"));
    a.add(1,'d');
  }
  return window.xValue    
};

function getData(a,b){
  window.crimeLink = "https://data.lacity.org/resource/7fvc-faax.geojson?$where=date_occ between '"+a+"' and '"+b+"'&$limit=100000&$$app_token=0ua4S7cGliNHTOoYNVyVoz7pz"
  $.getJSON(window.crimeLink, function(data) {
    window.origData = data
    geoLimit(data, window.site, a)
  })
};

function geoLimit(data, site, a){
  var coord = siteList[site]
      options = {steps: 64, units: 'miles', properties: {foo: 'bar'}};
      circle = turf.circle(coord, 1, options); // 1 mi circle around site
      window.within = turf.pointsWithinPolygon(data, circle);
  getPerimeter(site)
  filter(window.within, window.xValue)
  table(window.within)
  window.heatList = []
//  L.geoJSON(window.within, { //only within perimeter
  L.geoJSON(data, { //all data
    pointToLayer: activityMarker, //Draw points
    onEachFeature: function (feature, layer) { 
      window.heatList.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]),
      layer.bindPopup(feature.properties.crm_cd_desc + " on " + feature.properties.date_occ.slice(0,10));
      layer.on('mouseover', function (e) {this.openPopup();});
      layer.on('mouseout', function (e) {this.closePopup();});
    }}).addTo(map)

  L.heatLayer(window.heatList).addTo(heatMap)
}


function getPerimeter(site){
  if (site != ""){
    map.eachLayer(function (layer) {map.removeLayer(layer);});
    map.addLayer(basemapLayer);
    var coord = [siteList[site][1],siteList[site][0]]
        marker = L.marker(coord).addTo(map);
        heatMarker = L.marker(coord).addTo(heatMap);
        circle = L.circle(coord, {radius: 1610}).addTo(map);
        heatCircle = L.circle(coord, {radius: 1610}).addTo(heatMap); 
    map.fitBounds(circle.getBounds(),{maxZoom: 14});
    heatMap.fitBounds(circle.getBounds(),{maxZoom: 14}); // Zoom to site area
    //crime.addTo(map)
  }else{
    return
  }
}

function filter(data, dateList){
  window.crime = {}
  for (var i = 0; i < dateList.length; i++){
    window.crime[dateList[i]] = [0,0,0]
  }

  for (var i = 0; i < data.features.length; i++){
    var code = data.features[i].properties.crm_cd
        dateOcc = data.features[i].properties.date_occ.slice(0,10)
    if (window.vCodes.includes(code)){
      window.crime[dateOcc][0] += 1;
    }else if (window.pCodes.includes(code)) {
      window.crime[dateOcc][1] += 1;
    }else{
      window.crime[dateOcc][2] +=1;
    }
  }
  console.log(window.crime)
  breakdown(window.crime)
}

// function filter(data, dateStart){
//   var count = [0,0,0]
//       firstDate = moment(dateStart)
//       window.allDays = []

//   for (var i = 0; i < data.features.length; i++){
//     var code = data.features[i].properties.crm_cd
//         date = moment(data.features[i].properties.date_occ)
    
//     if (date.diff(firstDate, 'days') == 0){
//       count = crimeCategory(code,count)
//       if(i == (data.features.length-1)){window.allDays.push(count)}else{continue}
//     }else{
//       window.allDays.push(count)
//       count = [0,0,0]
//       firstDate.add(1,'d')
//       count = crimeCategory(code,count)
//       if(i == (data.features.length-1)){window.allDays.push(count)}else{continue}}
//   }
//   breakdown(window.allDays)
// };

function table(data){
  document.getElementById('allCrimes').innerHTML = ""
   for (var i = 0; i < data.features.length; i++){
      var from = turf.point(siteList[window.site])
          to = turf.point(data.features[i].geometry.coordinates)
         options = {units: 'miles'}
         distance = turf.distance(from, to, options).toPrecision(3)

    var row = "<tr><th scope='row'>"+data.features[i].properties.date_occ.substring(0,10)+"</th><td>"+data.features[i].properties.time_occ+"</td><td>"+data.features[i].properties.crm_cd_desc+"</td><td>"+distance+"</td></tr>"
    document.getElementById('allCrimes').innerHTML += row;
   } 
}

function crimeCategory(a,count){
  if (window.vCodes.includes(a)){
    count[0] += 1;
  }else if (window.pCodes.includes(a)) {
    count[1] += 1;
  }else{
    count[2] +=1;
  }
  return count
};

function breakdown(data){
  var a = Object.keys(data).map(function(key){
    return data[key];
  });

  window.vArray = []
  window.pArray = []
  window.oArray = []
//  window.allArray = []
  for (var i = 0; i < a.length; i++){
    window.vArray.push(a[i][0])
    window.pArray.push(a[i][1])
    window.oArray.push(a[i][2])
//    window.allArray.push(a[i][0]+a[i][1]+a[i][2])
  }

  c = {x: xAxis, y: vArray, type: 'bar', mode: 'lines', marker:{color:'#f58538'}, name: 'Violent',};
  d = {x: xAxis, y: pArray, type: 'bar', mode: 'lines', marker:{color:'#2b6dbc'}, name: 'Property',};
  e = {x: xAxis, y: oArray, type: 'bar', mode: 'lines',marker:{color:'#dad3cc'}, name: 'Other',};

  dataUpdated = [c,d,e]
  Plotly.newPlot('idiot', dataUpdated, layout, {responsive: true} );

  var clicked = document.getElementById('idiot')
  clicked.on('plotly_click', function(data){
    window.clickedDate = data.points[0].x
    
    var clickedPoints = []
    for (var i = 0; i < window.within.features.length; i++){ //getting events from clicked date
      console.log(window.within.features[i].properties.date_occ.slice(0,10),clickedDate)
      if (window.within.features[i].properties.date_occ.slice(0,10) == clickedDate){
        clickedPoints.push(window.within.features[i].properties.crm_cd_desc)
      }else{continue}
    }

    var crimeTypes = {}
    for (var i = 0; i < clickedPoints.length; i++){
      if (Object.keys(crimeTypes).includes(clickedPoints[i])){
        crimeTypes[clickedPoints[i]] += 1
      }else{
        crimeTypes[clickedPoints[i]] = 1
      }
    }

    window.dayLabels = Object.keys(crimeTypes)
    window.dayValues = Object.keys(crimeTypes).map(function(key){
    return crimeTypes[key];});

    console.log(clickedPoints, crimeTypes, dayLabels, dayValues)

    // var dayData = [{ labels: dayLabels, values: dayValues, type: 'pie', hole: .4,}];
    //     dayLayout = {showlegend: false}
    // Plotly.newPlot('graph2', dayData, dayLayout, {responsive: true});

  })


};


