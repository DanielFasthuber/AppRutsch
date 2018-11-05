import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import {DetailPage} from "../pages/detail/detail";
import {SyncPage} from "../pages/sync/sync";
import {MapPage} from "../pages/map/map";
import {ReportPage} from "../pages/report/report";
import {LoginPage} from "../pages/login/login";
import {ListPage} from "../pages/list/list";
import {EditPage} from "../pages/edit/edit";
import {EditlocationPage} from "../pages/editlocation/editlocation";
import {TabsPage} from "../pages/tabs/tabs";
import {LocationPage} from "../pages/location/location";
import { DatabaseProvider } from '../providers/database/database';
import { ContentProvider } from '../providers/content/content';
import { SearchPipe } from '../pipes/search/search';
import {MediaCapture} from "@ionic-native/media-capture";
import {Media} from "@ionic-native/media";
import {SQLite} from "@ionic-native/sqlite";
import {SQLitePorter} from "@ionic-native/sqlite-porter";
import { File } from '@ionic-native/file';
import {IonicStorageModule} from "@ionic/storage";
import {HttpModule} from "@angular/http";
import {IonicImageViewerModule} from "ionic-img-viewer";
import {Geolocation} from '@ionic-native/geolocation';
import {VideoEditor} from "@ionic-native/video-editor";
import {Camera} from "@ionic-native/camera";
import {FilePath} from "@ionic-native/file-path";
import { StreamingMedia} from '@ionic-native/streaming-media';
import { VideoPlayer } from '@ionic-native/video-player';
import { LocationProvider } from '../providers/location/location';
import { NativeAudio } from '@ionic-native/native-audio';
//import {LocationPage} from "../pages/location/location";

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    TabsPage,
    ListPage,
    ReportPage,
    MapPage,
    SyncPage,
    DetailPage,
    LocationPage,
    EditPage,
    EditlocationPage,
    SearchPipe,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpModule,
    IonicImageViewerModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    TabsPage,
    ListPage,
    ReportPage,
    MapPage,
    SyncPage,
    DetailPage,
    LocationPage,
    EditPage,
    EditlocationPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DatabaseProvider,
    ContentProvider,
    MediaCapture,
    Media,
    SQLite,
    SQLitePorter,
    Geolocation,
    File,
    VideoEditor,
    Camera,
    FilePath,
    StreamingMedia,
    VideoPlayer,
    LocationProvider,
    NativeAudio
  ]
})
export class AppModule {}
