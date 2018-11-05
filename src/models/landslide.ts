export class Landslide {

  private _title:string = "";
  private _datum: any;
  private _user_lat: number;
  private _user_long: number;
  private _slide_lat: number;
  private _slide_long: number;
  private _foto_count: number = 0;
  private _video_count: number = 0;
  private _memo_count: number = 0;
  private _user_id: number;
  private _thumbnail:string = "N/A";

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get datum(): any {
    return this._datum;
  }

  set datum(value: any) {
    this._datum = value;
  }

  get user_lat(): number {
    return this._user_lat;
  }

  set user_lat(value: number) {
    this._user_lat = value;
  }

  get user_long(): number {
    return this._user_long;
  }

  set user_long(value: number) {
    this._user_long = value;
  }

  get slide_lat(): number {
    return this._slide_lat;
  }

  set slide_lat(value: number) {
    this._slide_lat = value;
  }

  get slide_long(): number {
    return this._slide_long;
  }

  set slide_long(value: number) {
    this._slide_long = value;
  }

  get foto_count(): number {
    return this._foto_count;
  }

  set foto_count(value: number) {
    this._foto_count = value;
  }

  get video_count(): number {
    return this._video_count;
  }

  set video_count(value: number) {
    this._video_count = value;
  }

  get memo_count(): number {
    return this._memo_count;
  }

  set memo_count(value: number) {
    this._memo_count = value;
  }

  get user_id(): number {
    return this._user_id;
  }

  set user_id(value: number) {
    this._user_id = value;
  }

  get thumbnail(): string{
    return this._thumbnail;
  }

  set thumbnail(value: string){
    this._thumbnail = value;
  }
}

