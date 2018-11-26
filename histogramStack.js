////////setupMap/////////////
var map = new L.Map('map') //Initialize map
var basemapLayer = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNobGNoYW5nIiwiYSI6IjRlMWI3NDlhYmMxZWVlMzM0ZTM5MDU1M2RmZWZmOTI4In0.GINKorvt3kV6-YnRfH4iLQ');
map.setView([34.0522, -118.2437],11)
map.addLayer(basemapLayer);

// var heatMap = new L.Map('heatMap') //Initialize map
// var basemap = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicmNobGNoYW5nIiwiYSI6IjRlMWI3NDlhYmMxZWVlMzM0ZTM5MDU1M2RmZWZmOTI4In0.GINKorvt3kV6-YnRfH4iLQ');
// heatMap.setView([34.0522, -118.2437],11)
// heatMap.addLayer(basemap);

window.vCodes = ["110", "113", "121", "122", "230", "231", "235", "236", "250", "251", "435", "436", "622", "623", "624", "625", "626", "627", "753", "756"]
window.pCodes = ["210","220","310","320","330","331","341","341","343","345","347","349","350","351","352","353","410","420","421","440","441","442","443","444","445","446","450","451","452","453","470","471","472","473","474","475","480","485","487","510","520","647","648","740","740","745","924","950","951"]

window.arson=["648"]
window.assault=["230","231","622","623","624","625","235","236","626","627"]
window.burg=["310","320"]
window.murder=["110","113"]
window.rob=["210","220","341","341","343","345","350","351","352","353","440","441","442","443","444","445","446","450","451","452","453","470","471","472","473","474","475","480","485","487","347","349","662","664","666"]
window.vandal=["740","745"]
window.carBreak=["330","331","410","420","421"]
window.carTheft=["510","520"]

function activityMarker(feature, latlng){ // Point styling
  var circle = {
      radius: 4.5,
      color: getColor(feature.properties.crm_cd),
      weight: 1,
      fillOpacity: 0.65
  };
  return L.circleMarker(latlng, circle)
} 

function getColor(a){
  if (window.vCodes.includes(a)){return '#1b2a39';//'#f58538';
  }else if (window.pCodes.includes(a)) {return '#435c73';//'#2b6dbc';
  }else{return '#adc1d1'} //'#b5b5b5'
}

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
    data = [violent, property, other];
    layout = { title: 'Crime Types', yaxis: {rangemode: 'tozero', zeroline: true},  barmode: "stack"//, showlegend: false
};

Plotly.newPlot('idiot', data, layout,{responsive: true});

getParam()

function getParam(){
  var url = new URL(window.location.href);
      dateStart = url.searchParams.get("start");
      dateEnd = url.searchParams.get("end");
  window.site = url.searchParams.get("site");
  document.getElementById('title').innerHTML += dateStart+" to "+dateEnd;

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
  var pA = moment(a).subtract(8, 'days').format("YYYY-MM-DD");
      pB = moment(b).subtract(8, 'days').format("YYYY-MM-DD");
      pLink = "https://data.lacity.org/resource/7fvc-faax.geojson?$where=date_occ between '"+pA+"' and '"+pB+"'&$limit=100000&$$app_token=0ua4S7cGliNHTOoYNVyVoz7pz"
      crimeLink = "https://data.lacity.org/resource/7fvc-faax.geojson?$where=date_occ between '"+a+"' and '"+b+"'&$limit=100000&$$app_token=0ua4S7cGliNHTOoYNVyVoz7pz"

  $.getJSON(pLink, function(data) {
    window.pData = data
    console.log(pData)
  })

  $.getJSON(crimeLink, function(data) {
    geoLimit(data, window.site, a)
  })
};

function geoLimit(data, site, a){
    setTimeout( function(){
    var coord = siteList[site]
        options = {steps: 64, units: 'miles', properties: {foo: 'bar'}};
        circle = turf.circle(coord, 1, options); // 1 mi circle around site
    window.within = turf.pointsWithinPolygon(data, circle);
    window.pWithin = turf.pointsWithinPolygon(window.pData, circle)
    var withinView = turf.pointsWithinPolygon(data, turf.circle(coord, 4.4, options))
        allDiff = Math.round((window.within.features.length-window.pWithin.features.length)/window.within.features.length*100)
    document.getElementById('total').innerHTML += window.within.features.length +"<br>("+allDiff+"%)"
    getPerimeter(site)
    filter(window.within, window.xValue)
    cateCount(window.within, window.pWithin)
    table(window.within)

    points = {}

    for (var i = 0; i < withinView.features.length; i++){
      pointCoord = withinView.features[i].geometry.coordinates
      cd = withinView.features[i].properties.crm_cd

      if (points[pointCoord]==undefined){
        //points[pointCoord]=1
        if (window.vCodes.includes(cd)){points[pointCoord] = [1,0,0];
        }else if (window.pCodes.includes(cd)) {points[pointCoord] = [0,1,0];
        }else{points[pointCoord] = [0,0,1];}
      }else{
        if (window.vCodes.includes(cd)){points[pointCoord][0] += 1;
        }else if (window.pCodes.includes(cd)) {points[pointCoord][1] += 1;
        }else{points[pointCoord][2] +=1 ;}
      }
    }
    centers = Object.keys(points)

    centers.forEach(function(point) { //for each coordinate
      var chipIcons = [];
      //var rdColors = getRandomOrderedColors();
      for (var i = 0; i < points[point][0]; i++) { //assigning violent chips
        chipIcons.push(L.icon.chip({
        color: '#0d2d54' 
        }));
      }
      for (var i = 0; i < points[point][1]; i++) { //assigning property chips
        chipIcons.push(L.icon.chip({
        color: '#3F80BA' 
        }));
      }
      for (var i = 0; i < points[point][2]; i++) { //assigning other chips
        chipIcons.push(L.icon.chip({
        color: '#aec5da' 
        }));
      }

      pointStr = point.split(",")
      center = [Number(pointStr[1]),Number(pointStr[0])]
     
      var stack = L.marker.stack(center, {
        icons: chipIcons,
        stackOffset: [0, -5]
      });
      map.addLayer(stack);
    })




  //  L.geoJSON(window.within, { //only within perimeter
    // L.geoJSON(data, { //all data on viewable map (use "data" for all)
    //   pointToLayer: activityMarker, //Draw points
    //   onEachFeature: function (feature, layer) { 
    //     layer.bindPopup(feature.properties.crm_cd_desc + " on " + feature.properties.date_occ.slice(0,10));
    //     layer.on('mouseover', function (e) {this.openPopup();});
    //     layer.on('mouseout', function (e) {this.closePopup();});
    //   }}).addTo(map)

  }, 500)
}


function getPerimeter(site){
  if (site != ""){
    map.eachLayer(function (layer) {map.removeLayer(layer);});
    map.addLayer(basemapLayer);
    var coord = [siteList[site][1],siteList[site][0]]
        marker = L.marker(coord).addTo(map);
        circle = L.circle(coord, {radius: 1610, color:'LightGray'}).addTo(map);

    map.fitBounds(circle.getBounds(),{maxZoom: 14});
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
  breakdown(window.crime)
}

function cateCount(data, pData){
  var group = [0,0,0]
      pGroup = [0,0,0]
  
  for (var i = 0; i < data.features.length; i++){
    var a = data.features[i].properties.crm_cd
    if (window.vCodes.includes(a)){
      group[0] += 1;
    }else if (window.pCodes.includes(a)) {
      group[1] += 1;
    }else{
      group[2] += 1 ;}
  }
  for (var i = 0; i < pData.features.length; i++){
    var a = pData.features[i].properties.crm_cd
    if (window.vCodes.includes(a)){
      pGroup[0] += 1;
    }else if (window.pCodes.includes(a)) {
      pGroup[1] += 1;
    }else{
      pGroup[2] += 1;}
  }

  cateDiff(group, pGroup)
}

function cateDiff(a,b){
  var diff = []
  for (var i = 0; i < a.length; i++){
    console.log(a[i],b[i])
    diff[i] = Math.round((a[i]-b[i])/a[i]*100)
  }
  document.getElementById('violent').innerHTML += a[0] +"<br>("+diff[0]+"%)" ;
  document.getElementById('property').innerHTML += a[1] +"<br>("+diff[1]+"%)" ;
  document.getElementById('other').innerHTML += a[2] +"<br>("+diff[2]+"%)" ;
}

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
  }else if (window.pCodes.includes(a)){
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

  for (var i = 0; i < a.length; i++){
    window.vArray.push(a[i][0])
    window.pArray.push(a[i][1])
    window.oArray.push(a[i][2])
  }

  c = {x: xAxis, y: vArray, type: 'bar', mode: 'lines', marker:{color:'#0d2d54'}, name: 'Violent',};//'#f58538'}, name: 'Violent',};
  d = {x: xAxis, y: pArray, type: 'bar', mode: 'lines', marker:{color:'#3f80ba'}, name: 'Property',};//'#2b6dbc'}, name: 'Property',};
  e = {x: xAxis, y: oArray, type: 'bar', mode: 'lines',marker:{color:'#aec5da'}, name: 'Other',};//#dad3cc'}, name: 'Other',};

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

  })


  crimeType(window.within, window.pWithin)
}

function crimeType(data, pData){
  var count = [0, 0, 0, 0, 0, 0, 0, 0]
      pCount = [0, 0, 0, 0, 0, 0, 0, 0]
  
  for (var i = 0; i < data.features.length; i++){
    a = data.features[i].properties.crm_cd
    if (window.rob.includes(a)){count[0] += 1;
    }else if (window.assault.includes(a)){count[1] += 1;
    }else if (window.carBreak.includes(a)){count[2] += 1;
    }else if (window.burg.includes(a)){count[3] += 1;
    }else if (window.murder.includes(a)){count[4] += 1;
    }else if (window.vandal.includes(a)){count[5] += 1;
    }else if (window.carTheft.includes(a)){count[6] += 1;
    }else if (window.arson.includes(a)){count[7] += 1;
    }
  }
  for (var i = 0; i < pData.features.length; i++){
    a = pData.features[i].properties.crm_cd
    if (window.rob.includes(a)){pCount[0] += 1;
    }else if (window.assault.includes(a)){pCount[1] += 1;
    }else if (window.carBreak.includes(a)){pCount[2] += 1;
    }else if (window.burg.includes(a)){pCount[3] += 1;
    }else if (window.murder.includes(a)){pCount[4] += 1;
    }else if (window.vandal.includes(a)){pCount[5] += 1;
    }else if (window.carTheft.includes(a)){pCount[6] += 1;
    }else if (window.arson.includes(a)){pCount[7] += 1;
    }
  }
  compareTypes(count, pCount)
}

function compareTypes(a,b){
  diff = []
  for (var i = 0; i < a.length; i++){
    var now = a[i]
        last = b[i]
    if(last == 0){diff[i]=0
    }else{diff[i] = Math.round((now-last)/last*100)}
  }

  console.log(a,b,diff)
  document.getElementById("arson").innerHTML+= a[7]+"<br>("+diff[7]+"%)"
  document.getElementById("assault").innerHTML+= a[1]+"<br>("+diff[1]+"%)"
  document.getElementById("burglary").innerHTML+= a[3]+"<br>("+diff[3]+"%)"
  document.getElementById("murder").innerHTML+= a[4]+"<br>("+diff[4]+"%)"
  document.getElementById("robbery").innerHTML+= a[0]+"<br>("+diff[0]+"%)"
  document.getElementById("vandalism").innerHTML+= a[5]+"<br>("+diff[5]+"%)"
  document.getElementById("breakIn").innerHTML+= a[2]+"<br>("+diff[2]+"%)"
  document.getElementById("theft").innerHTML+= a[6]+"<br>("+diff[6]+"%)"
}





