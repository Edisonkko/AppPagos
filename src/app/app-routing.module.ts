import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { RegistroComponent } from './registro/registro.component';
import { DashboardComponent } from './pagos/dashboard.component';
import { ModalpagosComponent } from './modalpagos/modalpagos.component';

const routes: Routes = [
  {path: '',component:LoginComponent},
  {path: 'login',component:LoginComponent},
  {path: 'registro',component:RegistroComponent},
  {path: 'main',component:MainComponent,
  children:[
    {path: 'pagos',component:DashboardComponent},
    {path: 'pagos_anticipo',component:ModalpagosComponent}
  ],
  },
  
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
