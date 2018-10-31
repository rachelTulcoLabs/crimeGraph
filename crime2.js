var violent = {x: [], y: [], type: 'scatter'};
    property = {x: [], y: [], type: 'scatter'};
    other = {x: [], y: [], type: 'scatter'};
    all = {x: [], y: [], type: 'scatter'};
    data = [violent, property, all];
    layout = {yaxis: {rangemode: 'tozero', zeroline: true}, updatemenus: updatemenus};

Plotly.newPlot('idiot', data, layout,{responsive: true});

var updatemenus=[
    {
        buttons: [
            {
                args: [{'visible': [true, true, false, false]}],
                label: 'Violent',
                method: 'update'
            },
            {
                args: [{'visible': [false, false, true, true,]}],
                label: 'Property',
                method: 'update'
            },
            {
                args: [{'visible': [true, true, true, true,]},
                       //{'annotations': [...low_annotations, ...high_annotations]}
                      ],
                label: 'Other',
                method: 'update'
            },
            {
                args: [{'visible': [true, false, true, false,]}],
                label: 'All',
                method: 'update'
            },

        ],
        direction: 'left',
        pad: {'r': 10, 't': 10},
        showactive: true,
        type: 'buttons',
        x: 0.1,
        xanchor: 'left',
        y: 1.2,
        yanchor: 'top'
    },

]

function viewChange(){
  var site = document.getElementById('siteSelected').value
      dateStart = document.getElementById('dateStart').value+""
      dateEnd = document.getElementById('dateEnd').value+""
      violentFilter = document.getElementById('violentCrime').checked
      propertyFilter = document.getElementById('propertyCrime').checked // get user input parameters
  console.log(site, dateStart, dateEnd, violentFilter, propertyFilter)

  window.xAxis = dateDiff(dateStart, dateEnd)
  getData(dateStart, dateEnd)
};

function dateDiff(x,y){
  var a = moment(x)
      b = moment(y)
      d = b.diff(a,'days')
      xValue=[]
  for (i = 0; i < d+1; i++){  // getting dates for x axis values
    xValue.push(a.format("YYYY-MM-DD"));
    a.add(1,'d');
  }
  return xValue    
};

function getData(a,b){
  var crimeLink = "https://data.lacity.org/resource/7fvc-faax.geojson?$where=date_occ between '"+a+"' and '"+b+"'&$limit=100000&$$app_token=0ua4S7cGliNHTOoYNVyVoz7pz"
  $.getJSON(crimeLink, function(data) {
    (filter(data, a))
  })
};

function filter(data, date){
  var count = [0,0,0]
      dateStart = moment(dateStart)
      allDays = []
  
  for (var i = 0; i < data.features.length; i++){
    var code = data.features[i].properties.crm_cd
        date = moment(data.features[i].properties.date_occ)

    if (date.diff(dateStart, 'days') == 0){
      count = crimeCategory(code,count)
      if(i == (data.features.length-1)){allDays.push(count)}else{continue}
    }else{
      allDays.push(count)
      count = [0,0,0]
      dateStart.add(1,'d')
      count = crimeCategory(code,count)
      if(i == (data.features.length-1)){allDays.push(count)}else{continue}}
  }
  breakdown(allDays)
};

function crimeCategory(a,count){
  var vCodes = ["110", "113", "121", "122", "230", "231", "235", "236", "250", "251", "435", "436", "622", "623", "624", "625", "626", "627", "753", "756"]
      pCodes = ["210","220","310","320","330","331","341","341","343","345","347","349","350","351","352","353","410","420","421","440","441","442","443","444","445","446","450","451","452","453","470","471","472","473","474","475","480","485","487","510","520","647","648","740","740","745","924","950","951"]
  if (vCodes.includes(a)){
    count[0] += 1;
  }else if (pCodes.includes(a)) {
    count[1] += 1;
  }else{
    count[2] +=1;
  }
  return count
};

function breakdown(a){
  window.vArray = []
  window.pArray = []
  window.oArray = []
  window.allArray = []
  for (var i = 0; i < a.length; i++){
    window.vArray.push(a[i][0])
    window.pArray.push(a[i][1])
    window.oArray.push(a[i][2])
    window.allArray.push(a[i][0]+a[i][1]+a[i][2])
  }

  c = {x: xAxis, y: vArray, type: 'scatter', mode: 'lines', line:{color:'#f58538'}, name: 'Violent',};
  d = {x: xAxis, y: pArray, type: 'scatter', mode: 'lines', line:{color:'#30619c'}, name: 'Property',};
  e = {x: xAxis, y: oArray, type: 'scatter', mode: 'lines',line:{color:'#dad3cc'}, name: 'Other',};
  f = {x: xAxis, y: allArray, type: 'scatter', mode: 'lines', line: {dash: 'dot', color:'#dad3cc'},name: 'Total',};
  dataUpdated = [c,d,e,f]
  Plotly.newPlot('idiot', dataUpdated, layout, {responsive: true});
};

