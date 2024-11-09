import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.loginForm = new FormGroup({
      correo: new FormControl('', [Validators.required, Validators.email]),
      contrasena: new FormControl('', [Validators.required]),
      rut: new FormControl('', [Validators.required]),  // Agrega el campo rut
    });
  }

  async ngOnInit() {
    try {
      console.log('Verificando usuario almacenado en storage...');
      this.authService.getUsuarioActual(this.usuario.rut).subscribe((storedUser) => {
        if (storedUser) {
          console.log('Usuario encontrado en storage:', storedUser);
          this.router.navigate(['/menu', { rut: storedUser.rut }]); // Redirigir si ya hay un usuario
        } else {
          console.log('No se encontró usuario en storage');
        }
      });
    } catch (error) {
      console.error('Error al verificar usuario en storage', error);
    }
  }

  async login() {
    console.log('Formulario de login: ', this.loginForm.value); // Verifica qué datos se están enviando
  
    if (!this.loginForm.valid) {
      console.log('Formulario no válido');
      return; // Si el formulario no es válido, no hacer nada
    }
  
    const { correo, contrasena, rut } = this.loginForm.value; // Obtener valores del formulario, incluido rut
  
    try {
      console.log('Intentando login con correo:', correo);
      await this.authService.login(correo, contrasena, rut); // Pasa rut como parámetro adicional
      console.log('Login exitoso');
    } catch (error) {
      console.error('Credenciales incorrectas', error);
      // Aquí puedes mostrar el error en la vista
      this.errorMessage = 'Credenciales incorrectas. Intenta nuevamente.'; // Error de autenticación
    }
  }
  
}
