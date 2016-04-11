(function(){
  "use strict";

  var map = L.map('map').setView([40.71, -73.93], 11),
      airbnbGeoJson = '';

  var CartoDBTiles = L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: 'Map Data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors, Map Tiles &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  });

  map.addLayer(CartoDBTiles);

  L.control.geocoder('search-BCXXM8y').addTo(map);

  var dataLayer = L.geoJson().addTo(map);

  $('.boroughs').on('click', 'li', function(event) {
    event.preventDefault();
    var query = "SELECT * FROM table_29 WHERE neighbourhood_group = '" + $(this).text() + "'";

    plotData2Map(query);
  });

  /* Getting neighbourhood list from Brooklyn */
  /*
  var param = $.param({
    q: "SELECT neighbourhood FROM table_29 WHERE neighbourhood_group = 'Brooklyn' GROUP BY neighbourhood"
  });

  var url = "https://jeanpan.cartodb.com/api/v2/sql?" + param;

  var $select = $('#neighbourhood');

  $.getJSON(url).done(function(data) {
    var options = "",
        list = data.rows.sort(sortCompare);

    list.forEach(function(obj) {
      var option = "<option value='" + obj.neighbourhood + "'>" + obj.neighbourhood + "</option>"
      options = options + option;
    });

    $select.append(options);

    // plotData2Map($select.val());
  });

  $select.on('change', function(){;
    plotData2Map($(this).val());
  });
  */

  function plotData2Map(query) {
    var param = $.param({
      q: query,
      format: "GeoJSON"
    });

    var url = "https://jeanpan.cartodb.com/api/v2/sql?" + param;

    $.getJSON(url).done(function(data){
      // clean the layer
      map.removeLayer(airbnbGeoJson);

      var airbnbData = data;

      var airbnbPoint = function(feature, latlng) {
        var price = feature.properties.price,
            pointMarker = L.circleMarker(latlng, {
              stroke: false,
              fillColor: '#ffff00',
              fillOpacity: 0.9,
              radius: 6
            });

        return pointMarker;
      };

      var airbnbPointClick = function(feature, layer) {
        var properties = feature.properties;

        var content = '<p class="name">' + properties.name + '</p>' +
                      '<p class="price">$ ' + properties.price + '</p>' +
                      '<p class="type">' + properties.room_type + '</p>';

        layer.bindPopup(content);
      };

      airbnbGeoJson = L.geoJson(airbnbData, {
        pointToLayer: airbnbPoint,
        onEachFeature: airbnbPointClick
      }).addTo(map);

      map.fitBounds(airbnbGeoJson.getBounds());

    });
  }

  // sort object array by neighbourhood name
  function sortCompare(a, b) {
    if (a.neighbourhood < b.neighbourhood)
      return -1;
    else if (a.neighbourhood > b.neighbourhood)
      return 1;
    else
      return 0;
  }

})();
