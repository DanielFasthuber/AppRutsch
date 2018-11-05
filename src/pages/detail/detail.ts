import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {DatabaseProvider} from "../../providers/database/database";
import {StreamingMedia, StreamingVideoOptions, StreamingAudioOptions} from "@ionic-native/streaming-media";

@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {

  private landslide: any;
  private fotos = [];
  private videos =[];
  private memos = [];
  @ViewChild('myaudio') myAudio: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private databaseprovider: DatabaseProvider,
              private streamingMedia: StreamingMedia) {

    this.landslide = navParams.get('landslide');

  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter DetailPage');
    this.databaseprovider.getFoto(this.landslide.slide_id).then(data=>{
      this.fotos=data;
    })
    this.databaseprovider.getVideo(this.landslide.slide_id).then(data=>{
      this.videos=data;
    })
    this.databaseprovider.getAudio(this.landslide.slide_id).then(data=>{
      this.memos=data;
    })
  }

  playVideo(video){
    let options: StreamingVideoOptions = {
      successCallback: function() {
        console.log("Video was closed without error.");
      },
      errorCallback: function(errMsg) {
        console.log("Error! " + errMsg);
      },
      orientation: 'portrait'
    };
    this.streamingMedia.playVideo(video.video_path, options);
  }

  playAudio(memo) {
    let path = memo.memo_path;
    if ((memo.memo_path.indexOf('.m4a')|| memo.memo_path.indexOf('.3gpp')) > -1) {
      let audio = this.myAudio.nativeElement;
      audio.src = path;
      audio.play();
    }else{
      let options: StreamingAudioOptions = {
        successCallback: function() {
          console.log("Video was closed without error.");
        },
        errorCallback: function(errMsg) {
          console.log("Error! " + errMsg);
        },
        keepAwake: true
      };
      this.streamingMedia.playAudio(path, options);
    }
  }
}

