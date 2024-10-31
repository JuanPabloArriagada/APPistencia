import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AsistenciaService } from '../../services/asistencia.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.page.html',
  styleUrls: ['./escaner.page.scss'],
})
export class EscanerPage implements OnInit {
  isSupported = false;
  barcodes: Barcode[] = [];
  claseId: string = '';

  // Cambia 'private' a 'public'
  constructor(
    public navCtrl: NavController,
    private asistenciaService: AsistenciaService,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Verificar si el escaneo de código de barras es compatible
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      if (!this.isSupported) {
        this.showAlert('El escaneo de códigos de barras no es compatible con este dispositivo.');
      }
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }

    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
    for (const barcode of this.barcodes) {
      const scannedValue = barcode.rawValue;
      await this.showAlert(`Código de barras escaneado: ${scannedValue}`);

      // Asegúrate de que el formato sea correcto
      const parts = scannedValue.split('ClaseId: ');
      if (parts.length > 1) {
        this.claseId = parts[1];
        const alumnoId = this.route.snapshot.paramMap.get('rut') || '';
        await this.registrarAsistencia(alumnoId);
      } else {
        await this.showAlert('El formato del código escaneado es incorrecto.');
      }
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permiso denegado',
      message: 'Para usar la aplicación, autorizar los permisos de cámara',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async registrarAsistencia(alumnoId: string) {
    await this.showAlert(`Registrando asistencia para el alumno: ${alumnoId}`);
    try {
      const clase = await this.asistenciaService.obtenerClase(this.claseId).toPromise();

      if (!clase) {
        await this.showAlert('La clase no existe.');
        return;
      }

      if (clase.asistentes.includes(alumnoId)) {
        await this.showAlert(`El alumno ${alumnoId} ya está registrado en la asistencia.`);
      } else {
        const nuevosAsistentes = [...clase.asistentes, alumnoId];
        await this.asistenciaService.actualizarAsistencia(this.claseId, nuevosAsistentes, clase.inasistentes);
        await this.showAlert(`Asistencia registrada para el alumno ${alumnoId}`);
      }
    } catch (error) {
      const errorMessage = (error as any).message || error;
      await this.showAlert(`Error al registrar la asistencia: ${errorMessage}`);
    }
  }

  async showAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Información',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
