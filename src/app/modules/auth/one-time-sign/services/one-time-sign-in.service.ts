import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OneTimeSignInService {

  constructor(private _httpClient: HttpClient) { }


  signInByToken(token: string){
    return (`api/one-time-login`)
  }

}
