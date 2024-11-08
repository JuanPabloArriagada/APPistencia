import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from '../../interfaces/usuario';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  registroForm: FormGroup;
  errorMessage: string;

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
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registroForm = this.fb.group({
      rut: ['', Validators.required, Validators.maxLength(12)], // Rut sin puntos ni guión
      Nombre: ['', Validators.required, Validators.maxLength(40)], // Nombre completo
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]], // Correo electrónico
      contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/)]], // Al menos 6 caracteres, una mayúscula, una minúscula y un número y sin espacios
      rol: [{ value: '', disabled: true }],  
      foto: [''],
    });
    this.errorMessage = '';
  }

  ngOnInit() {}

  async registro() {
    if (!this.registroForm.valid) {
      return;
    }

    // Asignar valores del formulario al objeto usuario
    this.usuario = { ...this.registroForm.value };

    // Verificar el dominio del correo y asignar rol
    const correoDominio = this.usuario.correo.split('@')[1];
    this.usuario.rol = correoDominio === 'duocuc.cl' ? 'Estudiante' : 
                       correoDominio === 'profesor.duoc.cl' ? 'Profesor' : 
                       'Desconocido';

    // Validar el rol asignado antes de continuar
    if (this.usuario.rol === 'Desconocido') {
      this.errorMessage = 'El correo debe ser @duocuc.cl o @profesor.duoc.cl';
      return;
    }

    try {
      // Llamar al servicio de autenticación para registrar en Firebase
      await this.authService.registro(this.usuario);
      // Redirigir a la página de inicio de sesión tras registro exitoso
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error durante el registro:', error);
      this.errorMessage = 'Hubo un error durante el registro. Intenta nuevamente.';
    }
  }
}
