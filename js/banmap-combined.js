// get color depending on state population density value
function getColorStates(d) {
    return d > 1468 ? '#4D2D85' :
    d > 258  ? '#6E5A9D' :
    d > 125   ? '#9088B6' :
    d > 32    ? '#B1B5CF' : '#D3E3E8';
}
function style(feature) {
    return {
        weight: .5,
        opacity: .7,
        color: 'black',
        dashArray: '2',
        fillOpacity: .6,
        fillColor: getColorStates(feature.properties.density)
    };
}

function getColorCounties(d) {
    return d > 1468 ? '#4D2D85' :
    d > 258  ? '#6E5A9D' :
    d > 125   ? '#9088B6' :
    d > 32    ? '#B1B5CF' : '#D3E3E8';
}

function styleCounties(feature) {
    return {
        weight: .5,
        opacity: .7,
        color: 'black',
        dashArray: '2',
        fillOpacity: .6,
        fillColor: getColorCounties(feature.properties.DENSITY)
    };
}


function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}

function highlightFeatureCounties(e) {
    const countyLayer = e.target;

    countyLayer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
    });

    countyLayer.bringToFront();
    countyInfo.update(countyLayer.feature.properties);
}

const map = L.map('map', {        
    preferCanvas: true,
}).setView([37.8, -96], 5);

map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

//add tiles layer - no labels
const voyagerNo = L.tileLayer.provider('CartoDB.VoyagerNoLabels').addTo(map);

//add tiles - labels only
const voyagerLabels = L.tileLayer.provider('CartoDB.VoyagerOnlyLabels', {pane: 'labels'}).addTo(map);


//add states layer
const states = L.geoJson(statesALA, {
    style,
    onEachFeature
})

function resetHighlight(e) {
    states.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {	
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}
states.addTo(map);

//add counties layer
const counties = L.geoJson(countiesPEN, {
    style: styleCounties,
    onEachFeature: onEachFeatureCounties 

})
function resetHighlightCounties(e) {
    counties.resetStyle(e.target);
    countyInfo.update();
}

function zoomToFeatureCounties(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeatureCounties(feature, countyLayer) {	
    countyLayer.on({
        mouseover: highlightFeatureCounties,
        mouseout: resetHighlightCounties,
        click: zoomToFeatureCounties    
    });
}

const baseLayers = {
	'States (ALA Data)': states,
	'Counties (PEN America Data)': counties,
};
const layerControl = L.control.layers(baseLayers).addTo(map);

//add logo 
L.Control.Watermark=L.Control.extend({
        onAdd:function(map){
            var img = L.DomUtil.create('img');
            img.src = 'file:///C:/Users/pizza/Documents/design/Maps/banmap%20-%20statewide/img/TaglineLogo.png';
            img.style.width = '200px';
            return img;
            },
            onRemove:function(map){},
            });
            L.control.watermark = function(opts){
                return new L.Control.Watermark(opts);   
                }
            L.control.watermark({position:'bottomleft'}).addTo(map);

//control to add search feature to map
const searchControl = new L.esri.Controls.Geosearch().addTo(map);
const results = new L.LayerGroup().addTo(map);
  searchControl.on('results', function(data){
results.clearLayers();
    for (let i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
    }
     });

// control that shows state info on hover
const info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function (props) {
    const contents = props ? `<b>${props.name}</b><br />${props.density} attempted bans <br  />` : 'Hover over a state';
    this._div.innerHTML = `<h4>US  Book Bans</h4>${contents}`;
    this._div.setAttribute("style", "width:200px", "height:200")
};

info.addTo(map);

states.on('add', function(e) {
        info.addTo(map);
 });
 
 states.on('remove', function(e) {
        info.remove(map);
    
 });
// info.addTo(map);

// // control that shows county info on hover
const countyInfo = L.control();
countyInfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

countyInfo.update = function (props) {
    const countyContents = props ? `<b>${props.NAME}</b><br />${props.DENSITY} attempted bans <br  />` : 'Hover over a county';
    this._div.innerHTML = `<h4>US  Book Bans</h4>${countyContents}`;
    this._div.setAttribute("style", "width:200px", "height:200")
};

// countyInfo.addTo(map);

counties.on('add', function(e) {
        countyInfo.addTo(map);
    
 });
 
 counties.on('remove', function(e) {
        countyInfo.remove(map);
    
 });


// //add libraries in a cluster
const markers = L.markerClusterGroup();
const geoJsonLayer = L.geoJson(newLibraries, {
        onEachFeature: function (features, layer) {
            const popupText = '<b>Charter Number: </b>' + features.properties.Charter + '<br>' + '<b>Address: </b>' 
            + features.properties.Street +'<br>' + features.properties.City + ', ' + features.properties.State + '&nbsp;' + features.properties.Zip;
            layer.bindPopup(popupText);
        }
    }); 
markers.addLayer(geoJsonLayer);
map.addLayer(markers);	

//attribution for sources
map.attributionControl.addAttribution('Book Ban data &copy; <a href="https://pen.org/2023-banned-book-list/">PEN America, ALA</a>');
const provider = new window.GeoSearch.OpenStreetMapProvider();
const search = new GeoSearch.GeoSearchControl({
  provider: provider,
  style: 'bar',
  updateMap: true,
  autoClose: true,
}); 

// create map legend
const legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {

const div = L.DomUtil.create('div', 'info legend');
grades = [1469, 259, 126, 33, 0];
div.innerHTML += '<i style="background:' + getColorStates(grades[0]) + '"></i>' + grades[0] + '+ <br>' +
'<i style="background:' + getColorStates(grades[1]) + '"></i>' + grades[1] + '-' + grades[0] + '<br>' +
'<i style="background:' + getColorStates(grades[2]) + '"></i>' + grades[2] + '-' + grades[1] + '<br>' +
'<i style="background:' + getColorStates(grades[3]) + '"></i>' + grades[3] + '-' + grades[2] + '<br>' +
'<i style="background:' + getColorStates(grades[4]) + '"></i>' + grades[4] + '-' + grades[3] + '<br>' 

div.innerHTML += "<br> <b> Book Bans In Public Libraries <br> and Schools, Per State </b> <br> <br> <img src= file:///C:/Users/pizza/Documents/design/Maps/banmap%20-%20combined/img/libraryIcon.png width=40px height=40px> <br> <b> Little Free Libraries </b>"
return div;
};  
legend.addTo(map);


// // loop through our density intervals and generate a label with a colored square for each interval
// for (let i = 0; i < grades.length; i++) {
//     div.innerHTML +=
//         '<i style="background:' + getColorStates(grades[i] + 1) + '"></i> ' +
//         grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
// }
// div.innerHTML += "<br> <br> <b> Book Bans Per State </b> <br> <br> <img src= file:///C:/Users/pizza/Documents/design/Maps/banmap%20-%20combined/img/libraryIcon.png width=40px height=40px> <br> <b> Little Free Library Location </b>"
// return div;
// };  
legend.addTo(map);
