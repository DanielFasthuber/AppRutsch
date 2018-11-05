import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {ReportPage} from "../report/report";
import {ListPage} from "../list/list";
import {MapPage} from "../map/map";
import {SyncPage} from "../sync/sync";

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tab1Root = ReportPage;
  tab2Root = ListPage;
  tab3Root = MapPage;
  tab4Root = SyncPage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }

}
