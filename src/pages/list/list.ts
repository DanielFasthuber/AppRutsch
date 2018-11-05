import { Component } from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {DatabaseProvider} from "../../providers/database/database";
import {DetailPage} from "../../pages/detail/detail";
import {ContentProvider} from "../../providers/content/content";
import {Platform} from "ionic-angular";
import {EditPage} from "../edit/edit";
import {LoginPage} from "../login/login";
import { App } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-list',
  templateUrl: 'list.html',
})
export class ListPage {

  user = {};
  allLandslides = [];
  mineLandslides = [];
  active: string = "all";
  countAll: string;
  countMine: number;
  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseprovider: DatabaseProvider,
              private contentprovider: ContentProvider, private platform: Platform, private alertCtrl: AlertController,
              private toastCtrl: ToastController, private app: App) {

    this.platform.ready().then(()=> {
      this.databaseprovider.addSubscriber(this);
      this.databaseprovider.getDatabaseState().subscribe(rdy => {
        if (rdy) {
          this.loadAllLandslideData();
          this.loadMineLandslideData();
        }
      });
    });
  }

  ionViewWillEnter() {
    console.log('ionViewWiLLEnter: ListPage');
    this.contentprovider.setActiveSlide(null);
  }

  loadAllLandslideData() {
    this.databaseprovider.getAllLandslides().then(data => {
      this.allLandslides = data;
      this.countAll = this.allLandslides.length.toString();
    })
  }

  loadMineLandslideData() {
    this.databaseprovider.getMineLandslides().then(data => {
      this.mineLandslides = data;
      this.countMine = this.mineLandslides.length;
    })
  }
  showDetail(ls){
    this.contentprovider.setActiveSlide(ls);
    this.navCtrl.push(DetailPage, {'landslide': ls});
  }

  editLandslide(ls){
    this.contentprovider.setActiveSlide(ls);
    this.navCtrl.push(EditPage, {'landslide': ls});
  }

  deleteLandslide(id){
    let confirm = this.alertCtrl.create({
      title: 'Sure to DELETE this landslide?',
      message: '',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        }, {
          text: 'Yes',
          handler: () => {
            console.log('Agree clicked');
            this.databaseprovider.deleteLandslide(id);
            this.presentToast('Landslide deleted!');
          }
        }
      ]
    });
    confirm.present();
  }

  setAllVariable(){
    this.contentprovider.setActiveList('all');
  }
  setMineVariable(){
    this.contentprovider.setActiveList('mine');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListPage');
  }
  updateAllLandslides(data){
    this.allLandslides = data;
    this.countAll = this.allLandslides.length.toString();
  }

  updateMineLandslides(data){
    this.mineLandslides = data;
    this.countMine = this.mineLandslides.length;
  }

  private presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  logOut(){
    this.app.getRootNav().setRoot(LoginPage);
  }
}
