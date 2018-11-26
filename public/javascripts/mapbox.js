mapboxgl.accessToken =
  "pk.eyJ1IjoiYXNvbGVycCIsImEiOiJjam92ejA2ZGYxbWJrM3dwaDA4YmY1eDA2In0.dhk_MNpNlTqubZiObpTOtg";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/asolerp/cjow223sd3g1j2smcqo2im6as",
  center: [-3.7187152, 40.4291977],
  zoom: 5
});

map.on("load", function() {
  
  // Add geolocate control to the map.
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    })
  );

  var url = "/api/epoints2.geojson";
  // Add a new source from our GeoJSON data and set the
  // 'cluster' option to true. GL-JS will add the point_count property to your source data.
  map.addSource("epoints", {
    type: "geojson",
    // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
    // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
    data: url,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
  });

  console.log(map)

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "epoints",
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * Blue, 20px circles when point count is less than 100
      //   * Yellow, 30px circles when point count is between 100 and 750
      //   * Pink, 40px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#2fefef",
        20,
        "#2fefef",
        40,
       "#2fefef" ],
      "circle-radius": ["step", ["get", "point_count"], 15, 20, 15, 40, 15]
    }
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "epoints",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12
    }
  });

  map.loadImage("/images/map/epint.png", (error, image) => {
    if (error) throw error;
    map.addImage("epoint", image);
    map.addLayer({
      id: "epoint",
      type: "symbol",
      source: "epoints",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": "epoint",
        "icon-size": 0.2,
        "text-field": "{stationName}",
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-offset": [0, 3.2],
        "text-size": 10,
        "text-anchor": "top"
      }
    });
  });

  // map.addLayer({
  //     id: "unclustered-point",
  //     type: "circle",
  //     source: "epoints",
  //     filter: ["!", ["has", "point_count"]],
  //     paint: {
  //         "circle-color": "#11b4da",
  //         "circle-radius": 4,
  //         "circle-stroke-width": 1,
  //         "circle-stroke-color": "#fff"
  //     }
  // });

  

  // inspect a cluster on click
  map.on("click", "clusters", function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    var clusterId = features[0].properties.cluster_id;
    map
      .getSource("epoints")
      .getClusterExpansionZoom(clusterId, function(err, zoom) {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom
        });
      });
  });

  map.on("click", "epoint", function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.totalDocks;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`Number of docks in the station: ${description}`)
      .addTo(map);
  });

  map.on("mouseenter", "clusters", function() {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", function() {
    map.getCanvas().style.cursor = "";
  });
});
