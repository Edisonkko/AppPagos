import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from '../services/registro.service';
import { LoginServiceService } from '../services/login-service.service';
import Swal from 'sweetalert2';
function cedulaEcuatorianaValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | import("rxjs").Observable<ValidationErrors | null> => {
    const cedula = control.value;

    // Simula una demora para hacer la validación asíncrona
    return new Promise<ValidationErrors | null>((resolve) => {
      setTimeout(() => {
        const cedulaEsValida = validarCedulaEcuatoriana(cedula); // Cambia esto con tu lógica de validación
        if (cedulaEsValida) {
          resolve(null); // La cédula es válida
        } else {
          resolve({ cedulaEcuatoriana: true }); // La cédula no es válida
        }
      }, 1000); // Simulación de demora de 1 segundo
    });
  };
}

function validarCedulaEcuatoriana(cedula: string): boolean {
  // Verifica que tenga 10 dígitos
  if (cedula.length !== 10) {
    return false;
  }

  // Verifica que los dos primeros dígitos correspondan a un código de provincia
  const codigoProvincia = parseInt(cedula.substring(0, 2));
  if (codigoProvincia < 1 || codigoProvincia > 24) {
    return false;
  }

  // Obtenemos los dígitos de la cédula
  const digitos = cedula.split('').map((d: string) => parseInt(d, 10));
  
  // El décimo dígito de la cédula (que viene en la posición 9)
  const digitoVerificadorRecibido = digitos[9];

  // Los pares son los que están en posición par, los impares en impar
  const pares = [digitos[0], digitos[2], digitos[4], digitos[6], digitos[8]];
  const impares = [digitos[1], digitos[3], digitos[5], digitos[7]];

  // Multiplicamos los pares por 2  
  const multiplicacionesPares = pares.map((par: number) => par * 2);

  // Sumamos los dígitos de los números mayores a 9 (dígitos del 1 al 9 únicamente)
  let sumatoriaPares = 0;
  for (const par of multiplicacionesPares) {
    sumatoriaPares += par > 9 ? (par % 10) + Math.floor(par / 10) : par;
  }

  // Sumamos todos los impares
  const sumatoriaImpares = impares.reduce((a, b) => a + b, 0);

  // Sumamos los pares e impares
  const sumatoriaTotal = sumatoriaPares + sumatoriaImpares;

  // Obtenemos la decena superior
  const decenaSuperior = Math.ceil(sumatoriaTotal / 10) * 10;

  // Sacamos la diferencia entre la decena superior y la sumatoria total
  // El resultado debe ser igual al décimo dígito verificador
  const digitoVerificadorCalculado = decenaSuperior - sumatoriaTotal;
  console.log(digitoVerificadorCalculado === digitoVerificadorRecibido);
  
  // Comparamos el dígito verificador recibido con el calculado
  return digitoVerificadorCalculado === digitoVerificadorRecibido;
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  public myForm!:FormGroup;
  registroForm!: FormGroup;
  
  datosPaciente: any = {
    // Aquí debes definir los datos del paciente que deseas enviar al servicio
  };
  constructor(private router:Router,private formBuilder:FormBuilder, private Rserv: RegistroService,private loginService:LoginServiceService) { }

  ngOnInit(): void { 
    this.myForm = this.crearForm();
  }

  private crearForm():FormGroup{
    return this.formBuilder.group({
      correo: ['', [Validators.required]],
      usr_pass: ['', Validators.required],
      two_factor: [false],
      per_ced: ['', [Validators.required, Validators.pattern(/^\d{10}$/)],[cedulaEcuatorianaValidator()]],
      per_nom: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]],
      per_apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]*$/)]],
      per_tel: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      per_estado: ['1', Validators.required] 
    });
  }

  crearUsuario() {
    if (this.myForm.valid) {   
      this.Rserv.verificarcedula(this.myForm.value.per_ced).subscribe(resced=>{
        if(resced.info.cedula){
          console.log("la cedula ya está registrada.");
          Swal.fire(
            'la cedula ya está registrada.',
            'De click en el boton',
            'warning'
          )
        }else{
          this.Rserv.verificarcorreo(this.myForm.value.correo).subscribe(rescorreo=>{
            if(rescorreo.info.correo){
              console.log("El correo electrónico ya está registrado.");
              Swal.fire(
                'El correo electrónico ya está registrado.',
                'De click en el boton',
                'warning'
              )
            }else{
              if(this.cedulaEcuatoriana()===true){ 
                this.datosPaciente = {
                  usr_correo: this.myForm.value.correo,
                  usr_pass: this.myForm.value.usr_pass,
                  two_factor: this.myForm.value.two_factor,
                  per_ced: this.myForm.value.per_ced,
                  per_nom: this.myForm.value.per_nom,
                  per_apellido: this.myForm.value.per_apellido,
                  per_tel: this.myForm.value.per_tel,
                  per_estado: this.myForm.value.per_estado
                  };
                  
                  this.Rserv.registrarPaciente(this.datosPaciente).subscribe(resp=>{
                  console.log(resp);
                  Swal.fire(
                    resp.mensaje,
                    'De click en el boton',
                    'success'
                  ).then(result =>{
                    if(result.isConfirmed){
                      this.loginService.fun_login(this.myForm.value.correo, this.myForm.value.usr_pass).subscribe(loginResp=>{
                        console.log('Inicio de sesión exitoso:', loginResp);
                        if(loginResp.mensaje=='Acceso permitido'){
                          localStorage.setItem('usr_id', loginResp.info.items[0].USR_ID);
                          localStorage.setItem('rol_id', loginResp.info.items[0].ROL_ID);
                          localStorage.setItem('correo', loginResp.info.items[0].USR_CORREO);
                          localStorage.setItem('usr_pass', loginResp.info.items[0].USR_PASS);
                          localStorage.setItem('rol_desc', loginResp.info.items[0].ROL_DESC);
                          localStorage.setItem('id_especifico', loginResp.info.items[0].ID_ESPECIFICO);
                          localStorage.setItem('id_person', loginResp.info.items[0].PER_ID);
                          this.router.navigate(['/dashboard']); // Reemplaza '/dashboard' con la ruta de tu página de inicio
                        }
                        // Redirige al usuario a la página de inicio o cualquier otra página después del inicio de sesión exitoso
                      },
                      loginError => {
                        console.error('Error en el inicio de sesión:', loginError);
                        // Puedes manejar el error de inicio de sesión aquí si es necesario
                      });
                    }
                  });
                  
                  },error =>{
                  console.error(error);
                  }); 
              }else{
                Swal.fire(
                  'La cédula no es ecuatoriana.',
                  'De click en el botón',
                  'error'
                );
              }
              
            }
          });
        }
      })
    } else {
      // Manejar acciones cuando el formulario no es válido
      console.log('Formulario inválido');
    }
  }

  public get f():any{
    return this.myForm.controls;
  }

  login(){
    this.router.navigate(['/login'])
  }

  cedulaEcuatoriana() {
    const cedula = this.myForm.value.per_ced;
  
    // Verifica que tenga 10 dígitos
    if (cedula.length !== 10) {
      return false;
    }
  
    // Verifica que los dos primeros dígitos correspondan a un código de provincia
    const codigoProvincia = parseInt(cedula.substring(0, 2));
    if (codigoProvincia < 1 || codigoProvincia > 24) {
      return false;
    }
  
    // Obtenemos los dígitos de la cédula
    const digitos = cedula.split('').map((d: string) => parseInt(d, 10));
  
    // El décimo dígito de la cédula (que viene en la posición 9)
    const digitoVerificadorRecibido = digitos[9];
  
    // Los pares son los que están en posición par, los impares en impar
    const pares = [digitos[0], digitos[2], digitos[4], digitos[6], digitos[8]];
    const impares = [digitos[1], digitos[3], digitos[5], digitos[7]];
  
    // Multiplicamos los pares por 2  
    const multiplicacionesPares = pares.map((par: number) => par * 2);
  
    // Sumamos los dígitos de los números mayores a 9 (dígitos del 1 al 9 únicamente)
    let sumatoriaPares = 0;
    for (const par of multiplicacionesPares) {
      sumatoriaPares += par > 9 ? (par % 10) + Math.floor(par / 10) : par;
    }
  
    // Sumamos todos los impares
    const sumatoriaImpares = impares.reduce((a, b) => a + b, 0);
  
    // Sumamos los pares e impares
    const sumatoriaTotal = sumatoriaPares + sumatoriaImpares;
  
    // Obtenemos la decena superior
    const decenaSuperior = Math.ceil(sumatoriaTotal / 10) * 10;
  
    // Sacamos la diferencia entre la decena superior y la sumatoria total
    // El resultado debe ser igual al décimo dígito verificador
    const digitoVerificadorCalculado = decenaSuperior - sumatoriaTotal;
    console.log(digitoVerificadorCalculado === digitoVerificadorRecibido);
    // Comparamos el dígito verificador recibido con el calculado
    return digitoVerificadorCalculado === digitoVerificadorRecibido;
  }
  
}
