import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  URL_API: string = 'http://localhost/APIPAGOS/';

  constructor(private http: HttpClient) { }

  getPagos(){
    let URL=this.URL_API+"listarpagos";
    return this.http.get<any>(URL);
  }
}
