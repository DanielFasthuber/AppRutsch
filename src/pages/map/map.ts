import {Component, ElementRef, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams} from 'ionic-angular';
import {ContentProvider} from "../../providers/content/content";
import * as L from 'leaflet';
//import "leaflet.icon.glyph/Leaflet.Icon.Glyph";
import "leaflet-extra-markers/dist/js/leaflet.extra-markers.min";
import "leaflet-pulse-icon/dist/L.Icon.Pulse";
import "leaflet.markercluster/dist/leaflet.markercluster-src";
import {DatabaseProvider} from "../../providers/database/database";
import {LoginPage} from "../login/login";
import { App } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
})
export class MapPage {
  @ViewChild('map') mapContainer: ElementRef;
  map :any;
  center:any;
  private activeList:string;
  private activeSlide = null;
  layer:any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private contentprovider: ContentProvider, private databaseprovider: DatabaseProvider,
              private app: App) {


  }

  ionViewWillEnter() {
    //Todo check if there is Internet connection
    //console.log('ionViewWillEnter MapPage');

  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter MapPage');
    this.activeList = this.contentprovider.getActiveList();
    this.activeSlide = this.contentprovider.getActiveSlide();
    if(this.activeSlide == null && this.activeList == 'all'){
      this.databaseprovider.getAllLandslides().then( res=>{
        this.initLeafletMap(res);
      });
    }else if(this.activeSlide == null && this.activeList == 'mine'){
      this.databaseprovider.getMineLandslides().then( res=>{
        this.initLeafletMap(res);
      });
    }else{
      this.initLeafletSingleSlideMap(this.activeSlide);
    }
  }

  ionViewDidLeave(){
    console.log('ionViewDidLeave');
    this.map.remove();
    //document.getElementById("map").outerHTML = "";
  }
  ionViewCanLeave(){
    document.getElementById("map").outerHTML = "";
  }

  initLeafletMap(slides){
    //this.loader.present();

    this.map = L.map('map', {
      center: [47.69627,13.344755],
      maxBounds:[[46.36851,9.52678],[49.02403, 17.16273]],
      zoom: 6
    });
    //L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    this.layer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: 'pk.eyJ1IjoiZGFuaWVsZmFzdCIsImEiOiJjamRxaWJ2MWIxb3RrMzN0N2NpOXdkM213In0.083nVP1VAuf6ugLCHVEN5w'
    }).addTo(this.map);

    let markers = L.markerClusterGroup();


    for(let i = 0;i <slides.length; i++){
      let slide = slides[i];
      /*let marker = new L.Marker([slide.slide_lat,slide.slide_long])
        .bindPopup("Title: " + slide.title + "<br>Date: " + slide.datum+
          "<br>Landslide Location:<br>"+slide.slide_lat+', '+slide.slide_long)
        .addTo(this.map);*/

      markers.addLayer(L.marker([slide.slide_lat,slide.slide_long]).bindPopup("Title: " + slide.title + "<br>Date: " + slide.datum+
        "<br>Landslide Location:<br>"+slide.slide_lat+', '+slide.slide_long));
    }
    this.map.addLayer(markers);
    //Adds a scale to the map with km an miles
    L.control.scale().addTo(this.map);
  }

  initLeafletSingleSlideMap(slide){
    //this.loader.present();
    this.map = L.map('map', {
      center: [slide.user_lat, slide.user_long],
      zoom: 14
    });
    //L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    this.layer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: 'pk.eyJ1IjoiZGFuaWVsZmFzdCIsImEiOiJjamRxaWJ2MWIxb3RrMzN0N2NpOXdkM213In0.083nVP1VAuf6ugLCHVEN5w'
    }).addTo(this.map);

    //Adds a scale to the map with km an miles
    L.control.scale().addTo(this.map);

    let pulsingIcon = L.icon.pulse({iconSize:[10,10],color:'#488aff'});
    let userLocation = L.marker([slide.user_lat, slide.user_long],{icon: pulsingIcon})
      .bindPopup('User Location')
      .addTo(this.map);


    let marker = new L.Marker([slide.slide_lat, slide.slide_long])
      .bindPopup("Landslide Location: <P>"+slide.slide_lat+', '+slide.slide_long+"</P>")
      .addTo(this.map)
      .openPopup();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MapPage');
  }

  logOut(){
    this.app.getRootNav().setRoot(LoginPage);
  }

}
