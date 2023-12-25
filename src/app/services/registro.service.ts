import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  URL_API: string = 'https://dispensario.000webhostapp.com/APIPAGOS/';
  constructor(private http: HttpClient) { }

  registrarPaciente(datosPaciente: any) {
    const url = this.URL_API + 'crearPaciente'; // Ruta de la API para crear un paciente
    return this.http.post<any>(url, this.objectToFormData({
      usr_correo:datosPaciente.usr_correo,
      usr_pass:datosPaciente.usr_pass,
      per_ced:datosPaciente.per_ced,
      per_nom:datosPaciente.per_nom,
      per_apellido:datosPaciente.per_apellido,
      per_tel:datosPaciente.per_tel
    }));
  }

  verificarcedula(cedula:any){
    const url = this.URL_API + 'validarCedula';
    return this.http.post<any>(url,this.objectToFormData({
      per_ced:cedula
    }));
  }

  verificarcorreo(correo:any){
    const url = this.URL_API + 'validarCorreo';
    return this.http.post<any>(url,this.objectToFormData({
      usr_correo:correo
    }));
  }

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
