import { Component, inject } from '@angular/core';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { PagosService } from '../services/pagos.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  pagos: any[] = [];
  cards: any[] = [];

  constructor(private servPagos: PagosService, private breakpointObserver: BreakpointObserver) {}

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
          content: 'Pago pendiente'
        });
      }
      return cards;
    }, []);
  
    this.cards = [...currentMonthCards, ...notCurrentMonthCards];
  }
  
  
  

  formatPaymentData(pago: any) {
    const formattedDate = pago.FECHA_PAGOS ? new Date(pago.FECHA_PAGOS).toLocaleDateString() : 'Fecha pendiente';
    
    // Verifica si MONTO_PAGOS es un número antes de formatearlo
    const formattedAmount = isNaN(pago.MONTO_PAGOS) ? 'Monto no válido' : `$${Number(pago.MONTO_PAGOS).toFixed(2)}`;
    
    let status;
    if (pago.ESTADO_PAGOS === 'Completo') {
      status = 'Pagado';
    } else {
      status = 'Pendiente'; // Puedes agregar más condiciones según los posibles estados de pago
    }
  
    if (formattedDate === 'Fecha pendiente' || formattedAmount === 'Monto no válido' || status === 'Pendiente') {
      return 'Pago pendiente';
    }
  
    return `
      <div>Fecha de pago: ${formattedDate}</div>
      <div>Monto: ${formattedAmount}</div>
      <div>Estado: ${status}</div>
    `;
  }
  
  
  
  
}
