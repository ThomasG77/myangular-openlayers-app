import { Component, OnInit } from '@angular/core';

import Map from 'ol/map';
import WMS from 'ol/source/tilewms';
import TileLayer from 'ol/layer/tile';
import View from 'ol/view';
import OSM from 'ol/source/osm';
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import Geolocation from 'ol/geolocation';
import GeoJSON from 'ol/format/geojson';
import proj from 'ol/proj';

@Component({
  selector: 'app-mymap',
  templateUrl: './mymap.component.html',
  styleUrls: ['./mymap.component.css']
})
export class MymapComponent implements OnInit {

locationSource: VectorSource

  constructor() { }

  ngOnInit() {

    this.view = new View({
      center: [689805.19, 6222389.4],
      //minZoom: 11,
      maxZoom: 19,
      zoom: 12
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: this.view
    });

    this.locationSource = new VectorSource();

    this.vectorLayer_location = new VectorLayer({
      source: this.locationSource
    });

    this.map.addLayer(this.vectorLayer_location);

    var geolocation = new Geolocation({
      projection: this.view.getProjection()
    });

    geolocation.setTracking(true);

    geolocation.on('change:position', () => {
      var [longitude, latitude] = proj.toLonLat(geolocation.getPosition());
      fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}`).then(response => response.json())
        .then(json => {
          var features = (new GeoJSON()).readFeatures(json, {
            featureProjection: 'EPSG:3857'
          })
          var coordinates = geolocation.getPosition();
          this.locationSource.clear();
          this.locationSource.addFeatures(features);
          // Your feature contains the properties from your GeoJSON
          console.log(this.locationSource.getFeatures()[0].getProperties());
        });
    });

  }

}
