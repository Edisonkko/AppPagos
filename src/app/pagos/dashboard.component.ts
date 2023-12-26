import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { PagosService } from '../services/pagos.service';
import Swal from 'sweetalert2';
import { ModalpagosComponent } from '../modalpagos/modalpagos.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  pagos: any[] = [];
  cards: any[] = [];

  constructor(private servPagos: PagosService, private breakpointObserver: BreakpointObserver, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getPagos();
  }

  getPagos() {
    this.servPagos.getPagos().subscribe(resp => {
      this.pagos = resp.info.items;
      console.log(this.pagos);
      this.generateCards(); // Llama al método para generar las tarjetas
    });
  }

  generateCards() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Obtener el mes actual (0-11)
    const currentYear = currentDate.getFullYear(); // Obtener el año actual
  
    const currentMonthPayments = this.pagos.filter((pago) => {
      const paymentDate = new Date(pago.FECHA_PAGOS);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
  
    const uniqueClientNames = new Set<string>();
  
    const currentMonthCards = currentMonthPayments.reduce((cards, pago) => {
      const clientName = pago.Nombre_Cliente;
      if (!uniqueClientNames.has(clientName)) {
        uniqueClientNames.add(clientName);
        cards.push({
          title: clientName,
          cols: 1,
          rows: 1,
          content: this.formatPaymentData(pago)
        });
      }
      return cards;
    }, []);
  
    const notCurrentMonthPayments = this.pagos.filter((pago) => {
      const paymentDate = new Date(pago.FECHA_PAGOS);
      return paymentDate.getMonth() !== currentMonth || paymentDate.getFullYear() !== currentYear;
    });
  
    const notCurrentMonthCards = notCurrentMonthPayments.reduce((cards, pago) => {
      const clientName = pago.Nombre_Cliente;
      if (!uniqueClientNames.has(clientName)) {
        uniqueClientNames.add(clientName);
        cards.push({
          title: clientName,
          cols: 1,
          rows: 1,
          content: this.formatPaymentData(pago)
        });
      }
      return cards;
    }, []);
  
    this.cards = [...currentMonthCards, ...notCurrentMonthCards];

    this.cards.forEach((card) => {
      const pagosPersona = this.pagos.filter((pago) => pago.Nombre_Cliente === card.title);
      card.pagos = pagosPersona; // Almacena los pagos asociados a esta persona en la tarjeta
    });
  }
  
  
  

  formatPaymentData(pago: any) {
    const isPendingPayment = pago.content === 'Pago pendiente';
    const formattedDate = isPendingPayment ? new Date().toLocaleDateString() : (pago.FECHA_PAGOS ? new Date(pago.FECHA_PAGOS).toLocaleDateString() : 'Fecha pendiente');
    const formattedAmount = `$${Number(18).toFixed(2)}`;
    const amountPaid = isPendingPayment ? '$0.00' : (isNaN(pago.MONTO_PAGOS) ? 'Monto no válido' : `$${Number(pago.MONTO_PAGOS).toFixed(2)}`);
    const status = isPendingPayment ? 'Pago Pendiente' : (pago.ESTADO_PAGOS === 'Completo' ? 'Pago Completo' : 'Pago Pendiente');
    
    const paymentInfo = `Monto total a pagar: ${formattedAmount}`;
    const montoPagado = `Monto Aportado: ${amountPaid}`;
  
    return `
      <div>Fecha de pago: ${formattedDate}</div>
      <div>${paymentInfo}</div>
      <div>${montoPagado}</div>
      <div>Estado: ${status}</div>
    `;
  }
  
  
  
  
  pagar(card:any) {
    if (card.pagos && card.pagos.length > 0) {
      const primerPago = card.pagos[0]; // Aquí accedes al primer pago de esa persona
      const fechaActual = new Date();
      console.log(primerPago);
      // Lógica para realizar el pago utilizando primerPago u otros datos relevantes
      const nuevoPago = {
        PAC_ID: primerPago.ID_PAC,
        FECHA_PAGOS: this.getFormattedDate(fechaActual),
        MONTO_PAGOS: 18,
        ESTADO_PAGOS: "Completo"
      };
      this.servPagos.registrarPagos(nuevoPago).subscribe(resp=>{
        Swal.fire(
          resp.mensaje,
          'De click en el boton',
          'success'
        ).then(result=>{
          if(result.isConfirmed){
            location.reload();
          }
        });
      });
    }
    
  }
  getFormattedDate(date: Date): string {
    const adjustedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60 * 1000));
    const year = adjustedDate.getFullYear();
    const month = this.padZero(adjustedDate.getMonth() + 1);
    const day = this.padZero(adjustedDate.getDate());
  
    return `${year}-${month}-${day}`;
  }
 
  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  pagarAnticipo(card:any) {
    const pagoAnticipo = card.pagos[0];
    pagoAnticipo.ID_PAC
    const dialogRef = this.dialog.open(ModalpagosComponent, {
      width: '300px', // Ajusta el ancho según lo que necesites
      data: {pagoAnticipo}
    });
    
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal cerrado', result);
      // Aquí puedes agregar lógica después de cerrar el modal si es necesario
    });
  }
  
  
  
  
}
