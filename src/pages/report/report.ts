import { Component, ViewChild } from '@angular/core';
import {
  IonicPage, AlertController, NavController, NavParams, ActionSheetController, Platform, ToastController,
  LoadingController} from 'ionic-angular';
import {LocationPage} from "../../pages/location/location";
import {
  MediaCapture, MediaFile, CaptureError, CaptureVideoOptions,
  CaptureAudioOptions
} from '@ionic-native/media-capture';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { VideoEditor } from '@ionic-native/video-editor';
import { Camera, CameraOptions } from '@ionic-native/camera';
import {FilePath} from "@ionic-native/file-path";
import { StreamingMedia, StreamingVideoOptions} from '@ionic-native/streaming-media';
import {Landslide} from "../../models/landslide";
import {LocationProvider} from "../../providers/location/location";
import {DatabaseProvider} from "../../providers/database/database";

const Foto_MEDIA_FILES_KEY = 'FotoMediaFiles';
const Video_MEDIA_FILES_KEY = 'VideoMediaFiles';
const Audio_MEDIA_FILES_KEY = 'AudioMediaFiles';

declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {

  @ViewChild('myaudio') myAudio: any;
  slide: Landslide;
  title:string = "No Title";
  fotoMediaFiles = [];
  videoMediaFiles = [];
  audioMediaFiles = [];
  user_location = null;
  slide_location = null;
  dateTime: string="";
  loader:any;
  canLeave:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private file: File, private mediaCapture: MediaCapture,
              private storage: Storage, private videoEditor: VideoEditor, private alertCtrl: AlertController,
              private camera: Camera, public actionSheetCtrl: ActionSheetController, private filePath: FilePath,
              private platform: Platform, private toastCtrl: ToastController, private streamingMedia: StreamingMedia,
              private locationProvider: LocationProvider, private databaseProvider: DatabaseProvider,
              private loadingCtrl: LoadingController) {

    this.slide = new Landslide();
    this.loader = this.loadingCtrl.create({
      content: "Reporting Landslide... ",
      duration: 1500
    });
  }

  ionViewWillEnter() {
   console.log('ionViewDidLoad ReportPage');
   this.dateTime = this.getDateTime();

   if(this.locationProvider.getUserLocation()!== null){

         this.user_location = this.locationProvider.getUserLocation();
   }
    if(this.locationProvider.getSlideLocation()!== null){

      this.slide_location = this.locationProvider.getSlideLocation();
    }


    this.storage.get(Foto_MEDIA_FILES_KEY).then(res => {
      this.fotoMediaFiles = JSON.parse(res) || [];
    });

    this.storage.get(Video_MEDIA_FILES_KEY).then(res => {
      this.videoMediaFiles = JSON.parse(res) || [];
    });

    this.storage.get(Audio_MEDIA_FILES_KEY).then(res => {
      this.audioMediaFiles = JSON.parse(res) || [];
    });
  }

  async resetFormConfirm(){
    const shouldLeave = await this.confirmLeave();
    console.log('schould leave: ' + shouldLeave);
    if (shouldLeave){
      this.resetForm();
    }else return;
  }

  confirmLeave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Warning!',
      subTitle: 'Do you want to reset Report Page?',
      message: 'All data will be deleted..',
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

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Use Camera',
          icon: 'camera',
          handler: () => {
            this.captureFoto(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Load from Library',
          icon: 'images',
          handler: () => {
            this.captureFoto(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  captureFoto(sourceType) {
    // Create options for the Camera Dialog
    let options: CameraOptions = {
      quality: 50,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true
    };
    // Get the data of an image
    this.camera.getPicture(options).then((imagePath) => {
      // Special handling for Android library
      if (this.platform.is('android') && sourceType === this.camera.PictureSourceType.PHOTOLIBRARY) {
        this.filePath.resolveNativePath(imagePath)
          .then(filePath => {
            let correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
            let currentName = imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.lastIndexOf('?'));
            let filename = this.createFileName();
            this.copyFileToLocalDir(correctPath, currentName, filename);
          });
      } else {
        let currentName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
        let correctPath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
        let filename = this.createFileName();
        this.copyFileToLocalDir(correctPath, currentName, filename);
      }
    }, (err) => {
      this.presentToast('Error while selecting image.');
    });
  }

  captureVideo() {
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 45,
      quality:1
    };
    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
        let capturedFile = res[0];
        let duration: any;
        res[0].getFormatData(res=>{
          duration = res.duration;
        }, (err =>{
          console.log('err: ', err);
          duration = 0;
        }));
        let fileName = capturedFile.name;
        let dir = capturedFile['localURL'].split('/');
        dir.pop();
        let fromDirectory = dir.join('/');
        let toDirectory = this.file.dataDirectory;
        //alert('FromDirectory: '+ fromDirectory+ ', ToDirectory: '+ toDirectory+ ', Filename: '+ fileName);
        this.file.copyFile(fromDirectory , fileName , toDirectory , fileName).then((res) => {

          let thumbnail: any;
          this.videoEditor.createThumbnail({
            fileUri:toDirectory+fileName,
            outputFileName: 'thumbnail_' + fileName,
            width: 640,
            height: 960,
          }).then((fileUri: string) => {
            //alert('Thumbnail createt to: ' + fileUri);
            //alert('toDirectory+filename: ' + toDirectory+fileName + ' res: ' + res);
            thumbnail = 'file://'+fileUri;
            this.storeMediaFiles([{video_path: this.file.dataDirectory +fileName, size: capturedFile.size, duration: duration, video_thumbnail: thumbnail}], Video_MEDIA_FILES_KEY);

          }).catch((error: any) => console.log('Thumbnail transcode error', error));
        },err => {
          console.log('err: ', err);
        });

      },
      (err: CaptureError) => console.error(err));
  }

  captureAudio() {
    let options: CaptureAudioOptions = {
      limit: 1,
      duration: 180,
    };
    this.mediaCapture.captureAudio(options).then((res: MediaFile[]) => {
      let capturedFile = res[0];
      /* let duration: any;
      This method only works with .3gpp...
      capturedFile.getFormatData((res: MediaFileData) =>{
        duration = res.duration;
        alert('Duration: ' + res.duration + ' codec: ' + res.codecs);
      }, (err =>{
        console.log('err: ', err);
        //alert('ERRor Duration');
      }));*/
      let fileName = capturedFile.name;
      let dir = capturedFile['localURL'].split('/');
      dir.pop();
      let fromDirectory = dir.join('/');
      var toDirectory = this.file.dataDirectory;

      /*let d = new Date();
      let  n = d.getTime();
      let id =  n + ".m4a";*/
      let id = fileName;

      this.file.copyFile(fromDirectory , fileName , toDirectory , id).then((res) => {
        /*alert('res: ' + res.fullPath);
        alert('Audio: ' + fileName.toString() + ' FullPath: ' + capturedFile.fullPath);

        let file = this.media.create(capturedFile.fullPath);
        alert('file duration: ' +file.getDuration());
        file.play();*/
        let path = res.nativeURL;
        let url = path.replace(/^file:\/\//, '');

        this.storeMediaFiles([{memo_path: url, memo_id: id}], Audio_MEDIA_FILES_KEY);
      },err => {
        alert('err: ' + err);
      });
    }, (err: CaptureError) =>
      alert('capture error: '+ err));
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
    }
    else {
      alert("Sorry your audio format is not supported, please use .m4a or .3gpp. Your file ends with: " + path);
    }
  }

  play(myFile) {

    alert("test " + myFile.src);

    if ((myFile.src.indexOf('.m4a')|| myFile.src.indexOf('.3gpp')) > -1) {
      let path = myFile.src;
      let audio = this.myAudio.nativeElement;
      audio.src = path;
      audio.play();

    } else {

      let options: StreamingVideoOptions = {
        successCallback: function() {
          console.log("Video was closed without error.");
        },
        errorCallback: function(errMsg) {
          console.log("Error! " + errMsg);
        },
        orientation: 'portrait'
        //shouldAutoClose: true,  // true(default)/false
        //controls: true
      };
      this.streamingMedia.playVideo(myFile.src, options);
    }
  }

  storeMediaFiles(files, storagekey) {
    this.storage.get(storagekey).then(res => {
      if (res) {
        let arr = JSON.parse(res);
        arr = arr.concat(files);
        this.storage.set(storagekey, JSON.stringify(arr));
      } else {
        this.storage.set(storagekey, JSON.stringify(files))
      }
      if(storagekey == 'VideoMediaFiles') {
        this.videoMediaFiles = this.videoMediaFiles.concat(files);
      }if(storagekey == 'FotoMediaFiles'){
        this.fotoMediaFiles = this.fotoMediaFiles.concat(files);
      }
      if(storagekey == 'AudioMediaFiles'){
      this.audioMediaFiles = this.audioMediaFiles.concat(files);
      }
    }), err =>{
      alert('Error store Media Files: ' + err);
    };
  }

  updateMediaFiles(storagekey){
      if(storagekey == 'VideoMediaFiles'){
        this.storage.set(storagekey, JSON.stringify(this.videoMediaFiles));
        return;
      }if(storagekey == 'FotoMediaFiles'){
        this.storage.set(storagekey, JSON.stringify(this.fotoMediaFiles));
        return;
      }if(storagekey == 'AudioMediaFiles'){
        this.storage.set(storagekey, JSON.stringify(this.audioMediaFiles));
        return;
      }
      alert('Error update Media Files: ');
  }

  deleteFoto(index){
    let confirm = this.alertCtrl.create({
      title: 'Sure to DELETE this foto?',
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
            this.fotoMediaFiles.splice(index, 1);
            this.updateMediaFiles('FotoMediaFiles');
            //return true;
          }
        }
      ]
    });
    confirm.present();
  }

  deleteVideo(index){
    let confirm = this.alertCtrl.create({
      title: 'Sure to DELETE this video?',
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
            this.videoMediaFiles.splice(index, 1);
            this.updateMediaFiles('VideoMediaFiles');
            //return true;
          }
        }
      ]
    });
    confirm.present();
  }

  deleteAudio(index){
    let confirm = this.alertCtrl.create({
      title: 'Sure to DELETE this audio?',
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
            this.audioMediaFiles.splice(index, 1);
            this.updateMediaFiles('AudioMediaFiles');
            //return true;
          }
        }
      ]
    });
    confirm.present();
  }

  // Create a new name for the image
  private createFileName() {
    //Return the number of milliseconds since 1970/01/01
    let d = new Date();
    let  n = d.getTime();
      return  n + ".jpg";
  }
  createAudioFileName() {
    //Return the number of milliseconds since 1970/01/01
    let d = new Date();
     let  n = d.getTime();
      return n + ".m4a";
  }

// Copy the image to a local folder
  copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      //success.nativeURL will contain the path to the photo in permanent storage createPhoto(success.nativeURL);
      let fotopath = success.nativeURL;
      this.storeMediaFiles([{foto_path: fotopath}], Foto_MEDIA_FILES_KEY);
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }

  getDateTime(){
    let dt = new Date();
    let month = dt.getMonth()+1;
    let day = dt.getDate();
    let hours = dt.getHours();
    let min = dt.getMinutes();
    let sec = dt.getSeconds();
    let h,m,s,dd,mm;

    if(hours<10){
       h = "0" + hours.toString();
    }else h = hours;
    if(min <10){
       m = '0' + min.toString();
    }else m = min;
    if(sec <10){
       s = '0' + sec.toString();
    }else s = sec;

    if(month<10){
      mm = '0' + month.toString();
    }else mm = month;
    if(day <10){
      dd = '0' + day.toString();
    }else dd = day;

    return dt.getFullYear()+'-'+mm+'-'+dd+ ' ' + h+":" + m + ":" + s;
  }


  save(){
    if(this.user_location !== null && this.slide_location !== null && this.dateTime !==""){
      this.loader.present();
      if(this.slide.title == ""){
        this.slide.title = this.title;
      }
      this.slide.user_lat = this.user_location.user_lat;
      this.slide.user_long = this.user_location.user_long;
      this.slide.slide_lat = this.slide_location.slide_lat;
      this.slide.slide_long = this.slide_location.slide_long;
      this.slide.datum = this.dateTime;
      this.slide.foto_count = this.fotoMediaFiles.length;
      this.slide.video_count = this.videoMediaFiles.length;
      this.slide.memo_count = this.audioMediaFiles.length;
      this.slide.user_id = 1;

      if(this.fotoMediaFiles.length !==0){
        let thumb =this.fotoMediaFiles[0]
        this.slide.thumbnail = thumb.foto_path;
      }

      this.databaseProvider.addLandslide(this.slide).then( res=>{

        this.databaseProvider.getLastRowId().then(res=>{
          let slide_id = res[0].id;
          this.storeFotos(slide_id);
          this.storeVideos(slide_id);
          this.storeAudio(slide_id);

          this.loader.dismiss();
          this.clearForm();
          this.presentToast('Landslide successful reported!');
          //Todo delete edited/reported landslide and sync native storage with server if possible
          this.navCtrl.parent.select(1);
        }).catch( err => {
          this.presentToast('Failed to get last row id: ' + err.toString())
        });



      }).catch( err => {
        this.loader.dismiss();
        this.presentToast('Failed to report landslide, please try again: ' + err.toString())
      });
    }else this.presentToast('Please edit Location to report a landslide..');
  }

  locate(){
    console.log('Pressed Locate Button!');
    this.navCtrl.push(LocationPage)
      .then((response) => console.log(response)) // this logs
      .catch((error) => console.log('Access Denied! Error: '+error)); // this doesn't;
  }

  storeFotos(slide_id){
    if(this.fotoMediaFiles.length !== 0){

     for(let i=0; i<this.fotoMediaFiles.length; i++){
       this.databaseProvider.addFoto(this.fotoMediaFiles[i], slide_id);
     }
      this.fotoMediaFiles = [];

      this.storage.remove(Foto_MEDIA_FILES_KEY).then(res => {
        //this.presentToast('Foto_MEDIA_FILES_KEY storage removed!');
      });
    }
  }

  storeVideos(slide_id){
    if(this.videoMediaFiles.length !== 0){
      for(let i=0; i<this.videoMediaFiles.length; i++){
        this.databaseProvider.addVideo(this.videoMediaFiles[i], slide_id);
      }
      this.videoMediaFiles = [];

      this.storage.remove(Video_MEDIA_FILES_KEY).then(res => {

      });
    }
  }

  storeAudio(slide_id){
    if(this.audioMediaFiles.length !== 0){
      for(let i=0; i<this.audioMediaFiles.length; i++){
        this.databaseProvider.addAudio(this.audioMediaFiles[i], slide_id);
      }
      this.audioMediaFiles = [];
      this.storage.remove(Audio_MEDIA_FILES_KEY).then(res => {
      });
    }
  }

  resetForm(){
    this.slide = null;
    this.slide = new Landslide();
    this.storage.remove(Audio_MEDIA_FILES_KEY);
    this.storage.remove(Video_MEDIA_FILES_KEY);
    this.storage.remove(Foto_MEDIA_FILES_KEY);
    this.user_location = null;
    this.slide_location = null;
    this.locationProvider.setSlideLocation(null);
    this.locationProvider.setUserLocation(null);
    this.ionViewWillEnter();
  }
  clearForm(){
    this.slide = null;
    this.slide = new Landslide();
    this.user_location = null;
    this.slide_location = null;
    this.locationProvider.setSlideLocation(null);
    this.locationProvider.setUserLocation(null);
  }
}
