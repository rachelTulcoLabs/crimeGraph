function viewChange(){
  var site = document.getElementById('siteSelected').value
      dateStart = document.getElementById('dateStart').value+""
      dateEnd = document.getElementById('dateEnd').value+""
      violentFilter = document.getElementById('violentCrime').checked
      propertyFilter = document.getElementById('propertyCrime').checked // get user input parameters
  console.log(site, dateStart, dateEnd, violentFilter, propertyFilter)
  
  var a = moment(dateStart)
      b = moment(dateEnd)
      d = b.diff(a,'days')
      xValue=[]
  
  for (i = 0; i < d+1; i++) {  // getting dates for x axis values
    xValue.push(a.format("MM/DD/YY"));
    a.add(1,'d');}

  getData(dateStart, dateEnd)
}

function getData(a,b){
  var crimeLink = "https://data.lacity.org/resource/7fvc-faax.geojson?$where=date_occ between '"+a+"' and '"+b+"'&$limit=100000&$$app_token=0ua4S7cGliNHTOoYNVyVoz7pz"
  $.getJSON(crimeLink, function(data) {
    console.log("guh")
    dataSet = data
    return dataSet
  })
}

xValue = []
yValue = []

var violent = {
  x: xValue,  
  y: [10, 15, 13, 17], 
  type: 'scatter'
};
var property = {
  x: xValue,  
  y: [16, 5, 11, 9], 
  type: 'scatter'
};
var data = [violent, property];

var layout2 = {
  yaxis: {rangemode: 'tozero',
          zeroline: true}
};

Plotly.newPlot('idiot', data, layout2);





