import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from 'src/app/interfaces/usuario';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';

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
  constructor(private authService: AuthService, private router: Router, private storage: Storage) {
    this.loginForm = new FormGroup({
      correo: new FormControl('', [Validators.required, Validators.email]),
      contrasena: new FormControl('', [Validators.required]),
      rut: new FormControl('', [Validators.required]),  // Agrega el campo rut
    });
  }

  async ngOnInit() {
    try {
      console.log('Verificando usuario almacenado en storage...');
      const storedUser = await this.storage.get('usuario'); // Obtener el usuario del storage
  
      if (storedUser) {
        console.log('Usuario encontrado en storage:', storedUser);
        this.router.navigate(['/menu', { rut: storedUser.rut }]); // Redirigir si ya hay un usuario
      } else {
        console.log('No se encontró usuario en storage');
      }
    } catch (error) {
      console.error('Error al verificar usuario en storage', error);
    }
  }

  async login() {
    console.log('Formulario de login: ', this.loginForm.value);
  
    if (!this.loginForm.valid) {
      console.log('Formulario no válido');
      return; // Si el formulario no es válido, no hacer nada
    }
  
    const { correo, contrasena, rut } = this.loginForm.value; // Obtener valores del formulario, incluido rut
  
    try {
      console.log('Intentando login con correo:', correo);
  
      // Llamar al servicio para intentar el login
      const usuario = await this.authService.login(correo, contrasena, rut);
  
      // Verificar que el correo, el RUT y la contraseña coinciden en la base de datos
      if (usuario && usuario.rut === rut && usuario.correo === correo) {
        console.log('Login exitoso');
        // Redirigir a la página de menú si todo está bien
        this.router.navigate(['/menu', { rut: usuario.rut }]);
      } else {
        this.errorMessage = 'El correo, el RUT o la contraseña no coinciden.';
      }
    } catch (error) {
      console.error('Credenciales incorrectas', error);
      this.errorMessage = 'Credenciales incorrectas. Intenta nuevamente.'; // Error de autenticación
    }
  }
  
}
