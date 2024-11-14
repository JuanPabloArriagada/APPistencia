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
  successMessage: string = '';
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
      rut: ['', [
        Validators.required, 
        Validators.pattern(/^\d{8,9}$/), // Validar solo números y longitud entre 8 y 9
        Validators.maxLength(9) // Validar longitud máxima de 9 caracteres
      ]],      
      Nombre: ['', [Validators.required, Validators.maxLength(40)]], // Nombre completo
      correo: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(50), 
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
      ]], // Correo electrónico
      contrasena: ['', [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(20), 
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/)
      ]], // Al menos 6 caracteres, una mayúscula, una minúscula y un número ,sin espacios y sin simbolos o caracteres especiales
      rol: [{ value: '', disabled: true }],  
      foto: [''],
    });
    this.errorMessage = '';
  }

  ngOnInit() {}

  get rutInvalid() {
    const rut = this.registroForm.get('rut');
    if (rut?.hasError('required')) {
      return 'El RUT es obligatorio.';
    }
    if (rut?.hasError('maxLength')) {
      return 'El RUT no puede tener más de 9 caracteres.';
    }
    if (rut?.hasError('pattern') && rut?.value?.length > 0 && !rut?.value.match(/^\d+$/)) {
      return 'El RUT solo puede contener números.';
    }
    if (rut?.value && rut.value.length < 8) {
      return 'El RUT debe tener al menos 8 dígitos.';
    }
    if (rut?.value && rut.value.length > 9) {
      return 'El RUT no puede tener más de 9 dígitos.';
    }
    return '';
  }

  get nombreInvalid() {
    const nombre = this.registroForm.get('Nombre');
    return nombre?.hasError('required') ? 'El nombre es obligatorio.' :
           nombre?.hasError('maxLength') ? 'El nombre no puede tener más de 40 caracteres.' : '';
  }

  get correoInvalid() {
    const correo = this.registroForm.get('correo');
    return correo?.hasError('required') ? 'El correo es obligatorio.' :
           correo?.hasError('email') ? 'El correo debe ser válido.' :
           correo?.hasError('maxLength') ? 'El correo no puede tener más de 50 caracteres.' : 
           correo?.hasError('pattern') ? 'El formato del correo es incorrecto.' : '';
  }

  get contrasenaInvalid() {
    const contrasena = this.registroForm.get('contrasena');
    return contrasena?.hasError('required') ? 'La contraseña es obligatoria.' :
           contrasena?.hasError('minLength') ? 'La contraseña debe tener al menos 6 caracteres.' :
           contrasena?.hasError('maxLength') ? 'La contraseña no puede tener más de 20 caracteres.' :
           contrasena?.hasError('pattern') ? 'La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número, sin espacios y sin simbolos o caracteres especiales' : '';
  }

  async registro() {
    if (!this.registroForm.valid) {
      return;
    }
  
    this.usuario = { ...this.registroForm.value };
  
    // Verificar si el RUT ya está registrado
    const rutExistente = await this.authService.verificarRutExistente(this.usuario.rut);
    if (rutExistente) {
      this.errorMessage = 'El RUT ya está registrado.';
      return; // Detener el registro si el RUT está ocupado
    }
  
    // Verificar si el correo ya está registrado
    const correoExistente = await this.authService.verificarCorreoExistente(this.usuario.correo);
    if (correoExistente) {
      this.errorMessage = 'El correo electrónico ya está registrado.';
      return; // Detener el registro si el correo está ocupado
    }
  
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
      this.successMessage = 'Registro exitoso! Ahora puedes iniciar sesión.';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1000);  
    } catch (error) {
      console.error('Error durante el registro:', error);
      this.errorMessage = 'Hubo un error durante el registro. Intenta nuevamente.';
    }
  }
}
