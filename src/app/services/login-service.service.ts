import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  URL_API: string = 'https://dispensario.000webhostapp.com/APIPAGOS/';
  private userLoginOn: boolean = false;
  
  
  constructor(private http: HttpClient, private route: Router) { 
    const loginStatus = localStorage.getItem('userLoginOn');
    if (loginStatus) {
      this.userLoginOn = JSON.parse(loginStatus);
    }
  }

  //login
  fun_login(__email: string , __clave: string) {
    let URL = this.URL_API + "login";
    return this.http.post<any>(URL, this.objectToFormData({
      usuario: __email,
      clave: __clave
    })).pipe(
      tap(res=>{
        this.userLoginOn = res.mensaje === 'Acceso permitido';
        localStorage.setItem('userLoginOn', JSON.stringify(this.userLoginOn));
      })
    )

  }

  getMenuOpt(id:string) {
    let URL = this.URL_API + "menu/";
    return this.http.post<any>(URL,this.objectToFormData({
      perfil:id
    })); 
  }

  irA(pagina: string) {
    this.route.navigate([pagina]);
  }

  UserLogin(correo:any){
    const url = this.URL_API + 'userLogin';
    return this.http.post<any>(url,this.objectToFormData({
      usr_correo:correo
    }));
  }

  getUserLoginOn(): boolean {
    return this.userLoginOn;
  }
  setUserLoginOn(status: boolean): void {
    this.userLoginOn = status;
    localStorage.setItem('userLoginOn', JSON.stringify(this.userLoginOn));
  }
 
 

  //funciòn para armar el body
  objectToFormData(obj: any, form?: any, namespace?: any) {
    let fd: any = form || new FormData();
    let formKey: any;
    for (let property in obj) {
      if (obj.hasOwnProperty(property) && obj[property]) {
        if (namespace) {
          formKey = namespace + '[' + property + ']';
        } else {
          formKey = property;
        }
        if (obj[property] instanceof Date) {
          fd.append(formKey, obj[property].toISOString());
        }
        if (typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
          this.objectToFormData(obj[property], fd, formKey);
        } else {
          fd.append(formKey, obj[property]);
        }

      }
    }
    return fd;
  };

 

  

}
