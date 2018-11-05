import { Http} from '@angular/http';
import { Injectable } from '@angular/core';
import {Landslide} from "../../models/landslide";

@Injectable()
export class ContentProvider {

  public activelist: string = "all";
  public activeSlide = null;
  public landslides:Landslide[];

  constructor(public http: Http) {
    console.log('Hello ContentProvider Provider');
  }

  setActiveList(active){
    this.activelist = active;
  }

  getActiveList(){
    return this.activelist;
  }
  setActiveSlide(slide){
    this.activeSlide = slide;
  }

  getActiveSlide(){
    return this.activeSlide;
  }
  getallLandslides(){
    return this.landslides;
  }

}
