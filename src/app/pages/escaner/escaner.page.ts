import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AsistenciaService } from '../../services/asistencia.service';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';

interface Escaneo {
  claseId: number;
  asignatura: string;
  nombreAsignatura: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  sala: string;
}

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
  escaneoData: Escaneo | null = null;

  constructor(
    public navCtrl: NavController,
    private asistenciaService: AsistenciaService,
    private route: ActivatedRoute,
    private asignaturasService: AsignaturaService,
    private alertController: AlertController   
  ) {}

  ngOnInit() {
    this.checkBarcodeScannerSupport(); 
  }

  async checkBarcodeScannerSupport() {
    const result = await BarcodeScanner.isSupported();
    this.isSupported = result.supported;

    if (this.isSupported) {
      await BarcodeScanner.installGoogleBarcodeScannerModule(); 
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
  
    try {
      const { barcodes } = await BarcodeScanner.scan();
      
      if (barcodes.length === 0) {
        await this.presentAlert('No se escaneó ningún código.');
      } else {
        this.barcodes.push(...barcodes);
        for (const barcode of this.barcodes) {
          await this.presentAlert(`Código escaneado: ${barcode.rawValue}`);
          await this.processScannedValue(barcode.rawValue);
        }
      }
    } catch (error) {
      console.error('Error en el escáner:', error);
      await this.presentAlert('El escáner fue cerrado antes de escanear.');
    } finally {
      this.isScanning = false;  
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions(); 
    return camera === 'granted' || camera === 'limited';
  }

  async processScannedValue(scannedValue: string) {
    await this.presentAlert('Procesando el valor escaneado...');

    const claseMatch = scannedValue.match(/ClaseId:\s*(\d+)/);
    const asignaturaMatch = scannedValue.match(/Asignatura:\s*([^,]+)/);
    const nombreAsignaturaMatch = scannedValue.match(/NombreAsignatura:\s*([^,]+)/);
    const diaMatch = scannedValue.match(/Día:\s*([^,]+)/);
    const horaInicioMatch = scannedValue.match(/Inicio:\s*([^,]+)/);
    const horaFinMatch = scannedValue.match(/Fin:\s*([^,]+)/);
    const salaMatch = scannedValue.match(/Sala:\s*([^,]+)/);

    if (claseMatch && claseMatch[1]) {
      this.claseId = claseMatch[1];
    } else {
      await this.presentAlert('ID de Clase no encontrado en el código.');
      return;
    }

    if (asignaturaMatch && asignaturaMatch[1] && nombreAsignaturaMatch && nombreAsignaturaMatch[1]) {
      this.asignaturaId = asignaturaMatch[1];
      const escaneo: Escaneo = {
        claseId: Number(claseMatch[1]),
        asignatura: asignaturaMatch[1],
        nombreAsignatura: nombreAsignaturaMatch[1],
        dia: diaMatch ? diaMatch[1] : '',
        horaInicio: horaInicioMatch ? horaInicioMatch[1] : '',
        horaFin: horaFinMatch ? horaFinMatch[1] : '',
        sala: salaMatch ? salaMatch[1] : ''
      };
      this.escaneoData = escaneo;
      await this.presentAlert(`Datos escaneados: ${JSON.stringify(escaneo)}`);
    } else {
      await this.presentAlert('Datos de asignatura o nombre de asignatura no encontrados en el código.');
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
