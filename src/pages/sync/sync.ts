import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-sync',
  templateUrl: 'sync.html',
})
export class SyncPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController,
              public alertCtrl: AlertController) {
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter SyncPage');
    this.presentLoading();
    this.delay(4000).then(any=>{
      this.showAlert();
    });
    //this.navCtrl.parent.select(1);
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms)).then(()=>console.log("fired"));
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Checking your internet connection please wait...",
      duration: 3000
    });
    loader.present();
  }

  showAlert() {
    const alert = this.alertCtrl.create({
      title: 'Synchronised!',
      subTitle: 'Your local(offline) data has been transmitted to the server and your app is up to date!',
      buttons: ['OK']
    });
    alert.present().then(()=>{
      this.navCtrl.parent.select(1);
    });
  }
}
