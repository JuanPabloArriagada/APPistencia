// registro.page.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from '../../interfaces/usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  usuario: Usuario = {
    rut: '',
    Nombre: '',
    correo: '',
    rol: '',
    foto: '',
    contrasena: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  async registro() {
    try {
      // Verificar el dominio del correo y asignar rol
      const correoDominio = this.usuario.correo.split("@")[1];
      this.usuario.rol = correoDominio === "duocuc.cl" ? "Estudiante" : 
                         correoDominio === "profesor.duoc.cl" ? "Profesor" : 
                         "Desconocido";

      // Llamar a AuthService para registrar en Firebase Auth y Firestore
      await this.authService.registro(this.usuario);
      
      // Redirigir a la página de inicio de sesión tras registro exitoso
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error durante el registro:', error);
    }
  }
}
