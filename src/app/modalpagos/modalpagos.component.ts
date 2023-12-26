  import { Component, Inject } from '@angular/core';
  import { PagosService } from '../services/pagos.service';
  import { MatSnackBar } from '@angular/material/snack-bar';
  import { MAT_DIALOG_DATA } from '@angular/material/dialog';

  @Component({
    selector: 'app-modalpagos',
    templateUrl: './modalpagos.component.html',
    styleUrls: ['./modalpagos.component.css']
  })
  export class ModalpagosComponent {
    fechaPagos: Date= new Date();
    montoPagos: number| undefined;
    estadoPagos: string| undefined;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,private pagosService: PagosService, private snackBar: MatSnackBar) {
      console.log('Datos recibidos en el modal:', data.pagoAnticipo.ID_PAC);
    }

    guardarPago() {
      const formattedDate = this.formatDate(this.fechaPagos);
      const nuevoPago = {
        PAC_ID:this.data.pagoAnticipo.ID_PAC,
        FECHA_PAGOS: formattedDate,
        MONTO_PAGOS: this.montoPagos,
        ESTADO_PAGOS: this.estadoPagos
      };
      console.log(nuevoPago);
      // Aquí llamarías al método del servicio para guardar los datos
      this.pagosService.registrarPagos(nuevoPago).subscribe(
        () => {
          this.snackBar.open('Pago guardado exitosamente', 'Cerrar', {
            duration: 3000,
          });
        },
        error => {
          console.error('Error al guardar el pago', error);
          this.snackBar.open('Error al guardar el pago', 'Cerrar', {
            duration: 3000,
          });
        }
      );
    }
    formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = this.padZero(date.getMonth() + 1); // Agregar un cero si es menor que 10
      const day = this.padZero(date.getDate()); // Agregar un cero si es menor que 10
      return `${year}/${month}/${day}`;
    }
  
    padZero(num: number): string {
      return num < 10 ? `0${num}` : `${num}`;
    }
  }
