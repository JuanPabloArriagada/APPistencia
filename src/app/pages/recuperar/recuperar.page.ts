import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {
  correo: string = '';
  mensajeAlerta: { success: boolean, message: string } | null = null;

  constructor(private afAuth: AngularFireAuth) {}

  // Validación de correo
  validarCorreo(correo: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(correo);
  }

  async enviarCorreoRecuperacion() {
    if (!this.validarCorreo(this.correo)) {
      this.mensajeAlerta = { success: false, message: 'Por favor ingresa un correo válido.' };
      return;
    }

    try {
      await this.afAuth.sendPasswordResetEmail(this.correo);
      this.mensajeAlerta = { success: true, message: 'Correo enviado. Revisa tu bandeja de entrada para restablecer tu contraseña.' };
    } catch (error) {
      this.mensajeAlerta = { success: false, message: 'No se pudo enviar el correo. Verifica la dirección de correo e intenta de nuevo.' };
      console.error('Error al enviar el correo de recuperación:', error);
    }
  }
}
