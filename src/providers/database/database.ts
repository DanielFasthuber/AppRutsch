import { Http} from '@angular/http';
import { Injectable } from '@angular/core';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Storage} from "@ionic/storage";
import {SQLitePorter} from "@ionic-native/sqlite-porter";
import {Platform} from "ionic-angular";
import 'rxjs/add/operator/map';
import {ListPage} from "../../pages/list/list";
@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;
  user_id:number = 1;
  subscriber: ListPage;

  constructor(public http: Http, private sqlitePorter: SQLitePorter, private storage:Storage,
              private sqlite:SQLite, private platform: Platform) {
    this.databaseReady = new BehaviorSubject(false);
    this.platform.ready().then(()=> {
      this.sqlite.create({
        name: 'apprutsch.db',
        location: 'default'
      })
        .then((db:SQLiteObject) => {
          this.database = db;
          this.storage.get('database_filled').then(val =>{
            if(val){
              this.databaseReady.next(true);
            }else{
              this.fillDatabase();
            }
          })
        })
    });
  }

  fillDatabase(){
    this.http.get('assets/apprutsch.sql')
      .map(res => res.text())
      .subscribe(sql =>{
        this.sqlitePorter.importSqlToDb(this.database, sql)
          .then(data =>{
            this.databaseReady.next(true);
            this.storage.set('database_filled', true);
          })
          .catch(e =>console.log(e));
      });
  }

  addLandslide(slide){
    let landslide = [null,slide.title,slide.datum,slide.user_lat,slide.user_long,slide.slide_lat,slide.slide_long,slide.foto_count,slide.video_count ,slide.memo_count ,slide.user_id, slide.thumbnail];
    return this.database.executeSql("INSERT INTO landslide (slide_id, title,datum,user_lat,user_long,slide_lat,slide_long,foto_count,video_count ,memo_count ,user_id, thumbnail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", landslide).then(data => {
      console.log('addLandslide: ' + data.toString());
      this.subscriber.loadAllLandslideData();
      this.subscriber.loadMineLandslideData();
      return data;
    }, err => {
      console.log('Error: ', err);
      return err;
    });
  }

  updateLandslide(slide){
    let landslide = [slide.title,slide.datum,slide.user_lat,slide.user_long,slide.slide_lat,slide.slide_long,slide.foto_count,slide.video_count ,slide.memo_count ,slide.user_id, slide.thumbnail, slide.slide_id,];
    return this.database.executeSql("UPDATE landslide SET title = ?, datum = ?,user_lat = ?,user_long = ?,slide_lat = ?,slide_long = ?,foto_count = ?,video_count = ?,memo_count = ?,user_id = ?, thumbnail = ? WHERE slide_id = ?", landslide).then(data => {
      console.log('updatedLandslide: ' + data.toString());
      this.subscriber.loadAllLandslideData();
      this.subscriber.loadMineLandslideData();
      return data;
    }, err => {
      console.log('Error: ', err);
      return err;
    });
  }

  addFoto(f, slide_id){
    let foto = [null,f.foto_path,null, slide_id ];
    return this.database.executeSql("INSERT INTO foto (foto_id, foto_path, time_stamp, slide_id) VALUES (?,?,?,?)", foto).then(data => {
      console.log('addFoto: ' + data.toString());
      return data;
    }, err => {
      console.log('Error save foto in DB: ', err);
      return err;
    });
  }

  deleteFoto(path, slide_id){
    let substring = path .substring(5);
    //substring weil file: nur in " " gehen würde
    return this.database.executeSql("DELETE FROM foto WHERE foto_path = 'file:" + substring + "'",[]).then(data=> {
      console.log('Foto deleted' + data.toString());
      console.log('Update Foto count in landslide');
      this.database.executeSql("UPDATE landslide SET foto_count = foto_count - 1 WHERE slide_id = " + slide_id,[]).then(data=>{
        console.log('landslide foto count updated' + data.toString());
      }, err => {
        console.log('Error update foto count in landslide db: ', err);
      });
      this.subscriber.loadAllLandslideData();
      this.subscriber.loadMineLandslideData();
    }, err => {
      console.log('Error delete foto in DB: ', err);
    });
  }

  addVideo(v, slide_id){
    let video = [null,v.video_path,v.video_thumbnail, null, slide_id ];
    return this.database.executeSql("INSERT INTO video (video_id, video_path,video_thumbnail, time_stamp, slide_id) VALUES (?,?,?,?,?)", video).then(data => {

      return data;
    }, err => {

      return err;
    });
  }

  addAudio(a, slide_id){
    let memo = [null,a.memo_path, null, slide_id];
    return this.database.executeSql("INSERT INTO memo (memo_id, memo_path, time_stamp, slide_id) VALUES (?,?,?,?)", memo).then(data => {
      console.log('addAudio: ' + data.toString());
      return data;
    }, err => {
      console.log('Error save memo in DB: ', err);
      return err;
    });
  }

  getFoto(slide_id){
    return this.database.executeSql("SELECT * FROM foto WHERE slide_id = " + slide_id, []).then((data) => {
      let foto = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          foto.push({foto_id: data.rows.item(i).foto_id, foto_path: data.rows.item(i).foto_path, time_stamp: data.rows.item(i).time_stamp, slide_id: data.rows.item(i).slide_id});
        }
      }
      return foto;
    }, err => {
      console.log('Error getFoto from DB: ', err);
      return [];
    });
  }

  getVideo(slide_id){
    return this.database.executeSql("SELECT * FROM video WHERE slide_id = " + slide_id, []).then((data) => {
      let video = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          video.push({video_id: data.rows.item(i).video_id, video_path: data.rows.item(i).video_path, video_thumbnail: data.rows.item(i).video_thumbnail, time_stamp: data.rows.item(i).time_stamp, slide_id: data.rows.item(i).slide_id});
        }
      }
      return video;
    }, err => {
      console.log('Error getVideo from DB: ', err);
      return [];
    });
  }

  getAudio(slide_id){
    return this.database.executeSql("SELECT * FROM memo WHERE slide_id = " + slide_id, []).then((data) => {
      let audio = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          audio.push({memo_id: data.rows.item(i).memo_id, memo_path: data.rows.item(i).memo_path, time_stamp: data.rows.item(i).time_stamp, slide_id: data.rows.item(i).slide_id});
        }
      }
      return audio;
    }, err => {
      console.log('Error getAudio from DB: ', err);
      return [];
    });
  }


  getLastRowId(){
    return this.database.executeSql("SELECT last_insert_rowid() AS lastInsertRowID", []).then(data => {
      let rowid = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          rowid.push({id: data.rows.item(i).lastInsertRowID});
        }
      }
      return rowid;
    }, err => {
      alert('Error getting last insert rowid: ' + err);
      return err;
    });
  }

  deleteLandslide(id){
    return this.database.executeSql("DELETE FROM landslide WHERE slide_id = " + id, []).then(data => {
      this.subscriber.loadAllLandslideData();
      this.subscriber.loadMineLandslideData();
      return data;
    }, err => {
      console.log('Error: ', err);
      return err;
    });
  }

  deleteAllFotosOfSlide(slide_id){
    return this.database.executeSql("DELETE FROM foto WHERE slide_id = " + slide_id, []).then(data => {
      console.log('All fotos of landslide deletet id: ' + slide_id);
      return data;
    }, err => {
      console.log('Error delete all fotos of landslide id: ' + slide_id, err);
      return err;
    });
  }

  deleteAllVideosOfSlide(slide_id){
    return this.database.executeSql("DELETE FROM video WHERE slide_id = " + slide_id, []).then(data => {
      console.log('All videos of landslide deletet id: ' + slide_id);
      return data;
    }, err => {
      console.log('Error delete all videos of landslide id: ' + slide_id, err);
      return err;
    });
  }

  deleteAllMemosOfSlide(slide_id){
    return this.database.executeSql("DELETE FROM memo WHERE slide_id = " + slide_id, []).then(data => {
      console.log('All memo of landslide deletet id: ' + slide_id);
      return data;
    }, err => {
      console.log('Error delete all memo of landslide id: ' + slide_id, err);
      return err;
    });
  }

  getAllLandslides() {
    return this.database.executeSql("SELECT * FROM landslide INNER JOIN user ON landslide.user_id = user.user_id ORDER BY datum DESC", []).then((data) => {
      let landslides = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          landslides.push({ slide_id: data.rows.item(i).slide_id, title: data.rows.item(i).title, datum: data.rows.item(i).datum,
            user_lat: data.rows.item(i).user_lat, user_long: data.rows.item(i).user_long,
            slide_lat: data.rows.item(i).slide_lat, slide_long: data.rows.item(i).slide_long,foto_count: data.rows.item(i).foto_count,
            video_count: data.rows.item(i).video_count, memo_count: data.rows.item(i).memo_count, user_id: data.rows.item(i).user_id,
            thumbnail: data.rows.item(i).thumbnail, vorname: data.rows.item(i).vorname, nachname: data.rows.item(i).nachname});
        }
      }
      return landslides;
    }, err => {
      console.log('Error: ', err);
      return [];
    });
  }

  getMineLandslides() {
    return this.database.executeSql("SELECT * FROM landslide WHERE user_id = "+ this.user_id +" ORDER BY datum DESC", []).then((data) => {
      let landslides = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          landslides.push({ slide_id: data.rows.item(i).slide_id, title: data.rows.item(i).title, datum: data.rows.item(i).datum,
            user_lat: data.rows.item(i).user_lat, user_long: data.rows.item(i).user_long,
            slide_lat: data.rows.item(i).slide_lat, slide_long: data.rows.item(i).slide_long, user_id: data.rows.item(i).user_id });
        }
      }
      return landslides;
    }, err => {
      console.log('Error: ', err);
      return [];
    });
  }

  addSubscriber(sub){
    this.subscriber = sub;
  }

  getDatabaseState(){
    return this.databaseReady.asObservable();
  }
}

