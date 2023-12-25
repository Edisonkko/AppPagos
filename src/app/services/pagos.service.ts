import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  URL_API: string = 'https://dispensario.000webhostapp.com/APIPAGOS/';

  constructor(private http: HttpClient) { }

  getPagos(){
    let URL=this.URL_API+"listarpagos";
    return this.http.get<any>(URL);
  }

  registrarPagos(datosPagos:any){
    const url = this.URL_API + 'registrarPagos'; // Ruta de la API para crear una cita
    return this.http.post<any>(url, this.objectToFormData({
      PAC_ID:datosPagos.PAC_ID,
      FECHA_PAGOS:datosPagos.FECHA_PAGOS,
      MONTO_PAGOS:datosPagos.MONTO_PAGOS,
      ESTADO_PAGOS:datosPagos.ESTADO_PAGOS
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