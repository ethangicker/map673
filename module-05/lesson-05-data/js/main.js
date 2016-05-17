L.mapbox.accessToken = 'pk.eyJ1Ijoicmdkb25vaHVlIiwiYSI6Im5Ua3F4UzgifQ.PClcVzU5OUj17kuxqsY_Dg';

var map = L.mapbox.map('map', 'mapbox.light', {
    center: [-.23, 37.8],
    zoom: 7,
    minZoom: 6,
    maxZoom: 9,
    maxBounds: L.latLngBounds([-6.22, 27.72],[5.76, 47.83])
});

var  currentGrade= 1,
    girls,
    boys;
    scaleFactor = .6;


omnivore.csv('data/kenya_education_2014.csv')

.on('ready', function(e) {

        drawMap(e.target.toGeoJSON());
    })
        .on('error', function(e) {
            console.log(e.error[0].message);
});

function drawMap(schoolData) {
    // access to schoolData here
 girls = L.geoJson(schoolData,{
        pointToLayer: function(feature, latlng){

            return L.circleMarker(latlng,{
                color: '#D96D02',
                opacity: 1,
                weight: 2,
                fillOpacity: 0
            });
        }

    }).addTo(map);


   boys = L.geoJson(schoolData,{

        pointToLayer: function(feature, latlng){

            return L.circleMarker(latlng,{
                color: '#6E77B0',
                fillColor:'#1C9976',
                opacity: 1,
                weight: 2,
                fillOpacity: 0,
                radius: calcRadius(feature.properties.B1)
            });
        }

    }).addTo(map);
    updateSymbols();
    sequenceUI();
    infoWindow();
}





function updateSymbols() {

var radius,  // variable to hold each radius
allRadii = [];  // empty array to hold all values

girls.eachLayer(function(layer) {
        // store a reference to the radius value
        radius = calcRadius(Number(layer.feature.properties['G'+String(currentGrade)]));
        // use it to set the radius of the layer
        layer.setRadius(radius);
        // push it into the array
        allRadii.push(radius);
    });

    boys.eachLayer(function(layer) {
        radius = calcRadius(Number(layer.feature.properties['B'+String(currentGrade)]));
        layer.setRadius(radius);
        allRadii.push(radius);
    });   

    drawLegend(allRadii);

}








function calcRadius(val) {

        var radius = Math.sqrt(val/Math.PI);

            return radius * .6;
}





function sequenceUI() {

//var output = $('#grade span');

$('.slider')
.on('input change', function() {
    currentGrade = $(this).val();
    updateSymbols();
    $('#grade span').html(currentGrade);
});
}

function drawLegend(allRadii) {

    var legend = $('.legend');

    var circles = {
        max: ss.max(allRadii),
        median: ss.median(allRadii),
        min: ss.min(allRadii)
    }

    var svgCircles = '';

    var reverseCalc = function(radius) {
        return Math.round((Math.pow(radius/scaleFactor, 2) * Math.PI));
    }

    for (var circle in circles) {

        svgCircles += '<circle cx="'+ 80 +'" cy="'+ (circles[circle] - 140) * -1 +'" r="'+ circles[circle] +'" stroke="#d3d3d3" stroke-width="1" fill="ghostwhite" />';

        svgCircles += '<text x="'+ 60 +'" y = "'+ (circles[circle] - 120) * -1 +'" fill= "green">'+ reverseCalc(circles[circle]) +'</text>'
    }

    legend.html(svgCircles)

}



function infoWindow() {

var info = $('#info');

boys.on('mouseover', function(e) {

var props = e.layer.feature.properties;

info.show();
$('#info span').text(props.COUNTY);
$(".girls span:first-child").text('(grade '+String(currentGrade)+')');
$(".boys span:first-child").text('(grade '+String(currentGrade)+')');

$(".girls span:last-child").text(props['G'+String(currentGrade)].toLocaleString());
$(".boys span:last-child").text(props['B'+String(currentGrade)].toLocaleString());

e.layer.setStyle(
    { fillOpacity: .6,

    });
});

boys.on('mouseout', function(e) {
info.hide();
e.layer.setStyle({ 
    fillOpacity: 0,

});
});

    $(document).mousemove(function(e){
        info.css({"left": e.pageX + 6, "top": e.pageY - info.height() - 15}); 

        if(info.offset().top < 4) {
            info.css({"top": e.pageY + 15});
        }

    if(info.offset().left + info.width() >= $(document).width() - 40) {
info.css({"left": e.pageX - info.width() - 30});
}
});
    }

