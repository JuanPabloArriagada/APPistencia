import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verificar',
  templateUrl: './verificar.page.html',
  styleUrls: ['./verificar.page.scss'],
})
export class VerificarPage implements OnInit {
  codigo: string = '';
  metodoVerificacion: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    
  }

  verificar() {
    // Aquí verificas el código con el servidor
    console.log('Código:', this.codigo);
    console.log('Método de Verificación:', this.metodoVerificacion);

    // Si el código es correcto, redirige al usuario a la página de cambio de contraseña
    // this.router.navigate(['/cambiar-contraseña']);
  }
}
