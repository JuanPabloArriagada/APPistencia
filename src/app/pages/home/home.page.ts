import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  usuario: Usuario = {
    rut: '',
    Nombre: '',
    correo: '',
    rol: '',
    foto: '',
    contrasena: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    // Verificar si el usuario ya está almacenado en el storage
    const storedUser = await this.authService.getUsuarioActual();
    if (storedUser) {
      this.router.navigate(['/menu', { rut: storedUser.rut }]); // Redirigir si ya hay un usuario
    }
  }

  async login() {
    try {
      await this.authService.login(this.usuario.correo, this.usuario.contrasena);
    } catch (error) {
      console.error('Credenciales incorrectas', error);
    }
  }
}
