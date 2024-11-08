import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AsistenciaService } from '../../services/asistencia.service';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';


@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.page.html',
  styleUrls: ['./escaner.page.scss'],
})
export class EscanerPage implements OnInit {
  isSupported = false;
  barcodes: Barcode[] = [];
  claseId: string = '';
  isScanning: boolean = false;
  asignaturaId: string = '';

  constructor(
    public navCtrl: NavController,
    private asistenciaService: AsistenciaService,
    private route: ActivatedRoute,
    private asignaturasService: AsignaturaService,
    private alertController: AlertController   
  ) {}

  ngOnInit() {
    this.checkBarcodeScannerSupport(); // Verifica el soporte del escáner de códigos de barras
  }

  async checkBarcodeScannerSupport() {
    const result = await BarcodeScanner.isSupported();
    this.isSupported = result.supported;

    if (this.isSupported) {
      await BarcodeScanner.installGoogleBarcodeScannerModule(); // Instala el módulo de escaneo si es compatible
    }
  }

  async scan(): Promise<void> {
    await this.presentAlert('Solicitando permisos de cámara...');
    const granted = await this.requestPermissions();
    
    if (!granted) {
      await this.presentAlert('Permisos de cámara denegados.');
      return;
    }
    
    this.isScanning = true;
    await this.presentAlert('Iniciando escaneo...');
  
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
  
    for (const barcode of this.barcodes) {
      await this.presentAlert(`Código escaneado: ${barcode.rawValue}`);
      await this.processScannedValue(barcode.rawValue);
    }
  
    this.isScanning = false;
    await this.presentAlert('Escaneo finalizado.');
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions(); // Solicita permisos de cámara
    return camera === 'granted' || camera === 'limited';
  }

  async processScannedValue(scannedValue: string) {
    await this.presentAlert('Procesando el valor escaneado...');

    const claseMatch = scannedValue.match(/ClaseId:\s*(\d+)/);
    const asignaturaMatch = scannedValue.match(/Asignatura:\s*([^,]+)/);

    if (claseMatch && claseMatch[1]) {
      this.claseId = claseMatch[1];
      await this.presentAlert(`ID de Clase obtenido: ${this.claseId}`);
    } else {
      await this.presentAlert('ID de Clase no encontrado en el código.');
      return;
    }

    if (asignaturaMatch && asignaturaMatch[1]) {
      this.asignaturaId = asignaturaMatch[1];
      await this.presentAlert(`ID de Asignatura obtenido: ${this.asignaturaId}`);
    } else {
      await this.presentAlert('ID de Asignatura no encontrado en el código.');
      return;
    }

    const alumnoId = this.route.snapshot.paramMap.get('rut') || '';
    await this.registrarAsistencia(alumnoId, this.asignaturaId);
  } 


  async registrarAsistencia(alumnoId: string, asignaturaId: string) {
    try {
      const clase = await this.asistenciaService.obtenerClase(this.claseId);
  
      if (!clase) {
        await this.presentAlert('Clase no encontrada.');
        return;
      }
  
      const asignatura = await this.asignaturasService.obtenerAsignaturaPorId(asignaturaId);
      if (!asignatura) {
        await this.presentAlert('Asignatura no encontrada.');
        return;
      }
  
      if (clase.asistentes.includes(alumnoId)) {
        await this.presentAlert('El alumno ya está registrado en la asistencia.');
        return;
      }
  
      const nuevosAsistentes = [...clase.asistentes, alumnoId];
      const inasistentesActualizados = clase.inasistentes.filter(id => id !== alumnoId);
  
      await this.asistenciaService.actualizarAsistencia(this.claseId, nuevosAsistentes, inasistentesActualizados);
  
      if (!asignatura.inscritos.includes(alumnoId)) {
        await this.asignaturasService.inscribirAlumnoEnAsignatura(asignaturaId, alumnoId);
      }
  
      await this.presentAlert('Asistencia registrada exitosamente.');
    } catch (error: any) {
      await this.presentAlert(`Error al registrar la asistencia: ${error.message || error}`);
    }
  }
  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Información',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
