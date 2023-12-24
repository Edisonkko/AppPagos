import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginServiceService } from '../services/login-service.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public myForm!:FormGroup;
  mostrarRecuperacion:boolean=false;

  loginError:string="";
  

  loginForm=this.formBuilder.group({
    email:['', [Validators.required,Validators.email]],
    password: ['',Validators.required],
  })
  constructor(private formBuilder:FormBuilder, private router:Router, private loginService: LoginServiceService) { }

  ngOnInit(): void {
    this.myForm = this.crearForm();
  }

  private crearForm():FormGroup{
    return this.formBuilder.group({
      correo: ['', [Validators.required]],
      password:['', Validators.required]
    });
  }

  get email(){
    return this.loginForm.controls.email;
  }
  get password(){
    return this.loginForm.controls.password;
  }
  login(){
    if(this.myForm.valid){
      this.loginService.fun_login(this.myForm.controls['correo'].value,this.myForm.controls['password'].value)
      .subscribe(res=>{
        console.log(JSON.stringify(res)); 
        if(res.mensaje=='Acceso permitido'){
          localStorage.setItem('usr_id', res.info.items[0].USR_ID);
          localStorage.setItem('rol_id', res.info.items[0].ROL_ID);
          localStorage.setItem('correo', res.info.items[0].PER_NOM);
          localStorage.setItem('usr_pass', res.info.items[0].USR_PASS);
          localStorage.setItem('rol_desc', res.info.items[0].ROL_DESC);
          localStorage.setItem('id_especifico', res.info.items[0].ID_ESPECIFICO);
          localStorage.setItem('id_person', res.info.items[0].PER_ID);
          this.navegar();
        }else{
          this.loginForm.reset();
          Swal.fire(
            res.mensaje,
            'De click en el boton',
            'warning'
          )
        }
    });
    
    } 
    else{
      Object.values(this.myForm.controls).forEach(control=>{
        control.markAllAsTouched();
      })

    }
  }

 
 

  mostrarRecuperacionContrasena(){
    this.mostrarRecuperacion = true;
  }
  close(){
    this.mostrarRecuperacion = false;
  }

  public get f():any{
    return this.myForm.controls;
  }

  navegar(){  
    this.router.navigate(['/main']);
  }
 
  registro(){
    this.router.navigate(['/registro']);
  }
 
}
