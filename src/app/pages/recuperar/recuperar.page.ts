import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
})
export class RecuperarPage {
  correo: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private alertController: AlertController
  ) {}

  async enviarCorreoRecuperacion() {
    try {
      await this.afAuth.sendPasswordResetEmail(this.correo);
      this.mostrarAlerta('Correo enviado', 'Por favor, revisa tu bandeja de entrada para restablecer tu contraseña.');
    } catch (error) {
      this.mostrarAlerta('Error', 'No se pudo enviar el correo. Verifica la dirección de correo e intenta de nuevo.');
      console.error('Error al enviar el correo de recuperación:', error);
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
