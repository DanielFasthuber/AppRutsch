import { Component, ViewChild } from '@angular/core';
import {
  IonicPage, AlertController, NavController, NavParams, ActionSheetController, Platform, ToastController,
  LoadingController} from 'ionic-angular';
import {EditlocationPage} from "../../pages/editlocation/editlocation";
import {
  MediaCapture, MediaFile, CaptureError, CaptureVideoOptions, CaptureAudioOptions
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

declare var cordova: any;
const Foto_MEDIA_FILES_KEY_UPDATE = 'FotoMediaFilesUpdate';
const Video_MEDIA_FILES_KEY_UPDATE = 'VideoMediaFilesUpdate';
const Audio_MEDIA_FILES_KEY_UPDATE = 'AudioMediaFilesUpdate';

@IonicPage()
@Component({
  selector: 'page-edit',
  templateUrl: 'edit.html',
})
export class EditPage {

  @ViewChild('myaudio') myAudio: any;
  slide: any;
  user_location = null;
  slide_location = null;
  fotoMediaFiles = [];
  videoMediaFiles = [];
  audioMediaFiles = [];
  dateTime: string="";
  loader:any;
  canLeave:boolean = false;
  firstload:boolean = true;
  iseditlocation:boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private file: File, private mediaCapture: MediaCapture,
              private storage: Storage, private videoEditor: VideoEditor, private alertCtrl: AlertController,
              private camera: Camera, public actionSheetCtrl: ActionSheetController, private filePath: FilePath,
              private platform: Platform, private toastCtrl: ToastController, private streamingMedia: StreamingMedia,
              private locationProvider: LocationProvider, private databaseProvider: DatabaseProvider,
              private loadingCtrl: LoadingController) {

    this.slide = navParams.get('landslide');
    //this.locationProvider.setSlideLocation({slide_lat:this.slide.slide_lat, slide_long: this.slide.slide_long});
    //this.locationProvider.setUserLocation({user_lat: this.slide.user_lat, user_long: this.slide.user_long});
    this.loader = this.loadingCtrl.create({
      content: "Updating Landslide... ",
      duration: 1500
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditPage');
    this.iseditlocation = false;
  }

  ionViewWillEnter() {
    console.log('ionViewDidEnter DetailPage');
    this.dateTime = this.getDateTime();
    this.iseditlocation = false;

    if(this.locationProvider.getUserEditLocation() !== null){
      this.user_location = this.locationProvider.getUserEditLocation();
    }else{
      this.user_location = {user_lat: this.slide.user_lat, user_long: this.slide.user_long}
    }
    if(this.locationProvider.getSlideEditLocation()!== null){
      this.slide_location = this.locationProvider.getSlideEditLocation();
    }else{
      this.slide_location = {slide_lat:this.slide.slide_lat, slide_long: this.slide.slide_long}
    }

    if (this.firstload) {
      this.firstload = false;
      this.databaseProvider.getFoto(this.slide.slide_id).then(data => {
        this.fotoMediaFiles = data;
        this.updateMediaFiles('FotoMediaFilesUpdate');
      })
      this.databaseProvider.getVideo(this.slide.slide_id).then(data => {
        this.videoMediaFiles = data;
        this.updateMediaFiles('VideoMediaFilesUpdate');
      })
      this.databaseProvider.getAudio(this.slide.slide_id).then(data => {
        this.audioMediaFiles = data;
        this.updateMediaFiles('AudioMediaFilesUpdate');
      })
    } else {
      this.storage.get(Foto_MEDIA_FILES_KEY_UPDATE).then(res => {
        this.fotoMediaFiles = JSON.parse(res) || [];
      });

      this.storage.get(Video_MEDIA_FILES_KEY_UPDATE).then(res => {
        this.videoMediaFiles = JSON.parse(res) || [];
      });

      this.storage.get(Audio_MEDIA_FILES_KEY_UPDATE).then(res => {
        this.audioMediaFiles = JSON.parse(res) || [];
      });
    }
  }

  public presentActionSheet() {
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
      quality:0
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
            this.storeMediaFiles([{video_path: this.file.dataDirectory +fileName, size: capturedFile.size, duration: duration, video_thumbnail: thumbnail}], Video_MEDIA_FILES_KEY_UPDATE);

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

      let d = new Date();
      let  n = d.getTime();
      let id =  n + ".m4a";

      this.file.copyFile(fromDirectory , fileName , toDirectory , id).then((res) => {
        /*alert('res: ' + res.fullPath);
        alert('Audio: ' + fileName.toString() + ' FullPath: ' + capturedFile.fullPath);

        let file = this.media.create(capturedFile.fullPath);
        alert('file duration: ' +file.getDuration());
        file.play();*/
        let path = res.nativeURL;
        let url = path.replace(/^file:\/\//, '');

        this.storeMediaFiles([{memo_path: url, memo_id: id}], Audio_MEDIA_FILES_KEY_UPDATE);
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
    if ((memo.memo_path.indexOf('.m4a')|| memo.memo_path.indexOf('.3gpp')) > -1) {
      let path = memo.memo_path;
      let audio = this.myAudio.nativeElement;
      audio.src = path;
      audio.play();
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
      if(storagekey == 'VideoMediaFilesUpdate') {
        this.videoMediaFiles = this.videoMediaFiles.concat(files);
      }if(storagekey == 'FotoMediaFilesUpdate'){
        this.fotoMediaFiles = this.fotoMediaFiles.concat(files);
        //this.fotoMediaFiles.reverse();
      }
      if(storagekey == 'AudioMediaFilesUpdate'){
        this.audioMediaFiles = this.audioMediaFiles.concat(files);
      }
    }), err =>{
      alert('Error store Media Files: ' + err);
    };
  }

  updateMediaFiles(storagekey){
    if(storagekey == 'VideoMediaFilesUpdate'){
      this.storage.set(storagekey, JSON.stringify(this.videoMediaFiles));
      return;
    }if(storagekey == 'FotoMediaFilesUpdate'){
      this.storage.set(storagekey, JSON.stringify(this.fotoMediaFiles));
      return;
    }if(storagekey == 'AudioMediaFilesUpdate'){
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
            this.updateMediaFiles('FotoMediaFilesUpdate');
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
            this.updateMediaFiles('VideoMediaFilesUpdate');
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
            this.updateMediaFiles('AudioMediaFilesUpdate');
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
  private createAudioFileName() {
    //Return the number of milliseconds since 1970/01/01
    let d = new Date();
    let  n = d.getTime();
    return n + ".m4a";
  }

// Copy the image to a local folder
  private copyFileToLocalDir(namePath, currentName, newFileName) {
    this.file.copyFile(namePath, currentName, cordova.file.dataDirectory, newFileName).then(success => {
      //success.nativeURL will contain the path to the photo in permanent storage createPhoto(success.nativeURL);
      let fotopath = success.nativeURL;
      this.storeMediaFiles([{foto_path: fotopath}], Foto_MEDIA_FILES_KEY_UPDATE);
    }, error => {
      this.presentToast('Error while storing file.');
    });
  }

  private presentToast(text) {
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

      this.slide.user_lat = this.user_location.user_lat;
      this.slide.user_long = this.user_location.user_long;
      this.slide.slide_lat = this.slide_location.slide_lat;
      this.slide.slide_long = this.slide_location.slide_long;

      this.slide.datum = this.dateTime;
      this.slide.foto_count = this.fotoMediaFiles.length;
      this.slide.video_count = this.videoMediaFiles.length;
      this.slide.memo_count = this.audioMediaFiles.length;

      if(this.fotoMediaFiles.length !==0){
        let thumb =this.fotoMediaFiles[0]
        this.slide.thumbnail = thumb.foto_path;
      }
      this.databaseProvider.updateLandslide(this.slide).then( res=>{

      this.storeFotos(this.slide.slide_id);
      this.storeVideos(this.slide.slide_id);
      this.storeAudio(this.slide.slide_id);

      this.loader.dismiss();
      //this.clearForm();
      this.presentToast('Landslide successful updated!');
      //Todo delete edited/reported landslide and sync native storage with server if possible
      this.canLeave = true;
      this.firstload = true;
      this.locationProvider.setUserEditLocation(null);
      this.locationProvider.setSlideEditLocation(null);
      this.navCtrl.pop();

      }).catch( err => {
        this.loader.dismiss();
        this.presentToast('Failed to update landslide, please try again: ' + err.toString())
      });
    }else this.presentToast('Please edit Location to report a landslide..');
  }

  storeFotos(slide_id){
    this.databaseProvider.deleteAllFotosOfSlide(slide_id).then( res=>{
      if(this.fotoMediaFiles.length !== 0){

        for(let i=0; i<this.fotoMediaFiles.length; i++){
          let foto = this.fotoMediaFiles[i];

          this.databaseProvider.addFoto(foto, slide_id);
        }
        this.fotoMediaFiles = [];

        this.storage.remove(Foto_MEDIA_FILES_KEY_UPDATE).then(res => {
          //this.presentToast('Foto_MEDIA_FILES_KEY_UPDATE storage removed!');
        });
      }
    });
  }

  storeVideos(slide_id){
    this.databaseProvider.deleteAllVideosOfSlide(slide_id).then( res=>{
      if(this.videoMediaFiles.length !== 0){
        for(let i=0; i<this.videoMediaFiles.length; i++){
          this.databaseProvider.addVideo(this.videoMediaFiles[i], slide_id);
        }
        this.videoMediaFiles = [];

        this.storage.remove(Video_MEDIA_FILES_KEY_UPDATE).then(res => {

        });
      }
    });
  }

  storeAudio(slide_id){
    this.databaseProvider.deleteAllMemosOfSlide(slide_id).then( res=>{
      if(this.audioMediaFiles.length !== 0){
        for(let i=0; i<this.audioMediaFiles.length; i++){
          this.databaseProvider.addAudio(this.audioMediaFiles[i], slide_id);
        }
        this.audioMediaFiles = [];
        this.storage.remove(Audio_MEDIA_FILES_KEY_UPDATE).then(res => {
        });
      }
    });
  }

  resetForm(){
    this.slide = null;
    this.slide = new Landslide();
    this.storage.remove(Audio_MEDIA_FILES_KEY_UPDATE);
    this.storage.remove(Video_MEDIA_FILES_KEY_UPDATE);
    this.storage.remove(Foto_MEDIA_FILES_KEY_UPDATE);
    this.slide.user_location = null;
    this.slide.slide_location = null;
    this.locationProvider.setSlideLocation(null);
    this.locationProvider.setUserLocation(null);
    this.ionViewWillEnter();
  }
  clearForm(){
    this.slide = null;
    this.slide = new Landslide();
    this.slide.user_location = null;
    this.slide.slide_location = null;
    this.locationProvider.setSlideLocation(null);
    this.locationProvider.setUserLocation(null);
  }

  async ionViewCanLeave(){
    if (this.iseditlocation){
      return true;
    }
    if(this.canLeave == false){
      const shouldLeave = await this.confirmLeave();
      console.log('schould leave: ' + shouldLeave);
      return shouldLeave;
    }else {
      this.storage.remove(Audio_MEDIA_FILES_KEY_UPDATE);
      this.storage.remove(Video_MEDIA_FILES_KEY_UPDATE);
      this.storage.remove(Foto_MEDIA_FILES_KEY_UPDATE);
      this.firstload = true;
      return true;
    }
  }

  confirmLeave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Warning!',
      subTitle: 'Your changes will not be saved',
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

  editLandslideLocation(){
    this.iseditlocation = true;
    this.navCtrl.push(EditlocationPage, {'landslide': this.slide});
  }
}
