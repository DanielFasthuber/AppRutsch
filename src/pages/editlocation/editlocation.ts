import {Component, ElementRef, ViewChild} from '@angular/core';
import { IonicPage,AlertController, NavController, NavParams, LoadingController } from 'ionic-angular';
import * as L from 'leaflet';
import "leaflet-extra-markers/dist/js/leaflet.extra-markers.min";
import "leaflet-pulse-icon/dist/L.Icon.Pulse";
import {LocationProvider} from "../../providers/location/location";

@IonicPage()
@Component({
  selector: 'page-editlocation',
  templateUrl: 'editlocation.html',
})

export class EditlocationPage {
  @ViewChild('locationMap') mapContainer: ElementRef;
  map :any;
  loader:any;
  slideMarker: any = null;
  userMarker:any=null;
  center:any = [47.69627, 13.344755];
  private user_lat: any;
  private user_long: any;
  private slide_lat: any;
  private slide_long: any;
  cancel:boolean = null;
  canLeave:boolean = false;
  slide: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private loadingCtrl: LoadingController, private alertCtrl: AlertController,
              private locationProvider: LocationProvider) {
    this.slide = navParams.get('landslide');
    this.loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 1500
    });

  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit editlocation Page');
    this.canLeave = false;
    this.initLeafletMap();
  }


  initLeafletMap(){
    this.map = L.map('locationMap', {
      center: [this.slide.user_lat,this.slide.user_long],
      zoom: 16,
      maxBounds: [
        [46.271403, 9.197300],
        [49.038172, 17.276774]
      ]
    });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: 'pk.eyJ1IjoiZGFuaWVsZmFzdCIsImEiOiJjamRxaWJ2MWIxb3RrMzN0N2NpOXdkM213In0.083nVP1VAuf6ugLCHVEN5w'
    }).addTo(this.map);

    //Adds a scale to the map with km an miles
    L.control.scale().addTo(this.map);

    var pulsingIcon = L.icon.pulse({iconSize:[10,10],color:'#488aff'});
    this.userMarker = L.marker([this.slide.user_lat, this.slide.user_long],{icon: pulsingIcon})
      .bindPopup('Your position')
      .addTo(this.map)
      .openPopup();

    this.slideMarker = new L.Marker([(this.slide.slide_lat), this.slide.slide_long], {draggable: true})
      .bindPopup('<br>Drag marker to Landslide or </br> touch on map to relocate marker, then hit the <i class="fa fa-floppy-o" aria-hidden="true"></i> icon to save the Location</p>')
      .addTo(this.map)
      .openPopup();
    this.map.addLayer(this.slideMarker);

    this.loader.dismiss();

    this.map.on('click', e  => {
      if(this.slideMarker !== null){
        this.map.removeLayer(this.slideMarker);
        this.slideMarker = L.marker(e.latlng,{draggable: true})
          .bindPopup('<br>Drag marker to Landslide or </br> touch on map to relocate marker, then hit the <i class="fa fa-floppy-o" aria-hidden="true"></i> icon to save the Location</p>')
          .addTo(this.map);
      }else{
        this.slideMarker = L.marker(e.latlng,{draggable: true})
          .bindPopup('<br>Drag marker to Landslide or </br> touch on map to relocate marker, then hit the <i class="fa fa-floppy-o" aria-hidden="true"></i> icon to save the Location</p>')
          .addTo(this.map)
          .openPopup();
      }
    });
  }

  save(){
    this.user_lat = this.userMarker.getLatLng().lat.toPrecision(10);
    this.user_long = this.userMarker.getLatLng().lng.toPrecision(10);
    this.locationProvider.setUserEditLocation({user_lat: this.user_lat, user_long: this.user_long});
    this.slide_lat = this.slideMarker.getLatLng().lat.toPrecision(10);
    this.slide_long = this.slideMarker.getLatLng().lng.toPrecision(10);
    this.locationProvider.setSlideEditLocation({slide_lat:this.slide_lat, slide_long: this.slide_long});
    this.canLeave = true;
    this.navCtrl.pop();
  }

  async ionViewCanLeave(){
    if(this.canLeave == false){
      const shouldLeave = await this.confirmLeave();
      console.log('schould leave: ' + shouldLeave);
      return shouldLeave;
    }else return true;
  }

  confirmLeave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Warning!',
      subTitle: 'Your Location will not be saved',
      message: 'Do you want to leave the page?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => resolveLeaving(false)
        },
        {
          text: 'Yes',
          handler: () => resolveLeaving(true)
        }
      ]
    });
    alert.present();
    return canLeave;
  }
}

