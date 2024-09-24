import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {
  codigo:Number=0;
  email: string = '';
  metodoVerificacion: string = 'correo'; // Por defecto "correo"

  constructor(private router: Router) {}

  setCode(codigo: Number){
    this.codigo = codigo;
  }

  recuperar() {
    // Aquí envías el correo o SMS al usuario
    console.log('Correo:', this.email);
    console.log('Método de Verificación:', this.metodoVerificacion);

    // Después de enviar el correo/SMS, navega a la página de verificar
    this.router.navigate(['/verificar'], { state: { metodoVerificacion: this.metodoVerificacion }} );
  }

  
}
