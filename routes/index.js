const express = require("express");
const router = express.Router();
const axios = require("axios");
const download = require("download-file");
const excelToJson = require("convert-excel-to-json");
const fs = require("fs");
const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyCuk2d2fTSNcW00vsinu3jJQOlPu-WBmy4",
  Promise: Promise
});

// Download dataBase points of charge Gob Page
var url =
  "https://sedeaplicaciones.minetur.gob.es/Greco/DatosRISP.aspx?fichero=exportarexcel";

// Options of the library will download the dataBase of the Gob
var options = {
  directory: "./public/excels/",
  filename: "epoints.xlsx"
};

// Time for setInterval
var dayInMilliseconds = 1000 * 60 * 60 * 24;

// SetInterval that will download once a day the dataBase of the Gob

setInterval(() => {
  axios
    .get(
      "https://www.electromaps.com/ejson/puntos_cluster.json?lat_min=-21.575513063103706&lon_min=-20.639870293229592&lat_max=44.58498114533759&lon_max=5.6512646524009824&zoom=17&vehiculos=T&tipos=T&connectors=T&velocidades=T&active_app=0&active_rfid=0&lista=ALL"
    )
    .then(response => {
      fs.writeFile(
        "./epoints2.geojson",
        JSON.stringify(convertToGeoJSON(response.data)),
        err => {
          if (!err) {
            console.log("done");
          }
        }
      );
    });
  // download(url, options, function(err) {
  //   if (err) throw err;
  // });

  // // Library that will convert the xls downloaded into a Json file

  // const resultExcelToJson = excelToJson({
  //   sourceFile: "./public/excels/epoints.xlsx",
  //   header: {
  //     rows: 1
  //   },
  //   columnToKey: {
  //     A: "{{A1}}",
  //     B: "{{B1}}",
  //     C: "{{C1}}",
  //     D: "{{D1}}",
  //     E: "{{E1}}",
  //     F: "{{F1}}",
  //     G: "{{G1}}"
  //   }
  // });

  // Iterate each point of charge get its directions and remplace by the location calling the Google Maps API

  // for (let i in resultExcelToJson) {
  //   for (let j in resultExcelToJson[i]) {
  //     googleMapsClient
  //       .geocode({
  //         address: `${resultExcelToJson[i][j].Direccion}, ${
  //           resultExcelToJson[i][j].Provincia
  //         }`
  //       })
  //       .asPromise()
  //       .then(response => {
  //         var location = response.json.results[0].geometry.location;
  //         resultExcelToJson[i][j].coordenadas = location;
  //       })
  //       .catch(err => {
  //         console.log(err);
  //       });
  //   }
  // }

  // Once it makes all the changes save the new Json file into the folder

  // setTimeout(() => {
  //   fs.writeFile("./epoints.geojson", JSON.stringify(convertToGeoJSON(resultExcelToJson)), err => {
  //     if (!err) {
  //       console.log("done");
  //     }
  //   });
  // }, 6000);
}, 1000000);

function convertToGeoJSON(json) {
  var count = 1;

  var geojson = {
    type: "FeatureCollection",
    features: []
  };

  for (i = 0; i < json.simple.length; i++) {
    console.log(json.simple[i]);

    geojson.features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [json.simple[i].longitud, json.simple[i].latitud]
      },
      properties: {
        id: json.simple[i].idpdr,
        stationName: json.simple[i].nombre
      }
    });

    // count++;
  }

  console.log(geojson);
  return geojson;
}

/* GET home page */

router.get("/", (req, res, next) => {
  res.render("index");
});

module.exports = router;
