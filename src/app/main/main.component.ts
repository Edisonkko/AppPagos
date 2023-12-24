import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import {BreakpointObserver} from '@angular/cdk/layout';
import { LoginServiceService } from '../services/login-service.service';
import { NavigationEnd, Router } from '@angular/router';
import { PagosService } from '../services/pagos.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  correo!: string;
  admin!:string;
  userLoginOn:boolean=false;
  listaOptMenus!: any[];
  verCard:boolean=false;
  pacientes!:number;
  medicos!:number;
  especialidades!:number;
  citas!:number;
  pagos: any[] = [];
  cards: any[] = [];
  isMainPage: boolean = false;
  constructor(private observer: BreakpointObserver, private cd:ChangeDetectorRef, private loginService:LoginServiceService,private router: Router,private servPagos: PagosService) { 
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isMainPage = (event.url === '/main'); // Cambia '/main' por la ruta de tu página principal
      }
    });
  }
  


  ngOnInit(): void {
    this.userLoginOn = this.loginService.getUserLoginOn();
    this.correo = localStorage.getItem('correo') || '';
    this.admin = localStorage.getItem('rol_desc') || '';

    this.loginService.setUserLoginOn(this.userLoginOn); // Actualizar el estado de inicio de sesión en el servicio
    this.recuperarListaMenu();
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
  

  logout(): void {
    localStorage.removeItem('usr_id');
    localStorage.removeItem('rol_id');
    localStorage.removeItem('correo');
    localStorage.removeItem('usr_pass');

    this.loginService.setUserLoginOn(false); // Actualizar el estado de la sesión
    this.router.navigateByUrl('/login');
  }

  ngAfterViewInit(){
    this.observer.observe(['(max-width: 800px)']).subscribe((resp:any)=> {
      //console.log(resp);
      if(resp.matches){
        this.sidenav.mode = 'over';
        this.sidenav.close();
      }else{
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    });
    this.cd.detectChanges();
  }

  recuperarListaMenu(){
    const perId = localStorage.getItem('rol_id');
     console.log(localStorage);
    // console.log(perId);
    if (perId !== null) {
      //console.log("id: " + perId);
      this.loginService.getMenuOpt(perId).subscribe(resp => {
        this.listaOptMenus = resp;
       // console.log("men: ", this.listaOptMenus);
      });
    } else {
     // console.log("PER_ID no está presente en el Local Storage");
    }
  }

  ir(direccion: string){
    // console.log(direccion);
    if (window.innerWidth <= 768) {
      this.sidenav.close(); // Cerrar el mat-sidenav en pantallas pequeñas
    }
    this.loginService.irA(direccion);
   }


}
