import { Injectable } from '@angular/core';

@Injectable()
export class LocationProvider {

  user_location: any = null;
  slide_location: any = null;
  user_edit_location: any = null;
  slide_edit_location: any = null;

  constructor() {
    console.log('Hello LocationProvider Provider');
  }
  setUserLocation(userloc){
    this.user_location = userloc;
  }
  getUserLocation(){
    return this.user_location;
  }

  setSlideLocation(slideloc){
    this.slide_location = slideloc;
  }

  getSlideLocation(){
    return this.slide_location;
  }

  setUserEditLocation(userloc){
    this.user_edit_location = userloc;
  }
  getUserEditLocation(){
    return this.user_edit_location;
  }

  setSlideEditLocation(slideloc){
    this.slide_edit_location = slideloc;
  }

  getSlideEditLocation(){
    return this.slide_edit_location;
  }

}
