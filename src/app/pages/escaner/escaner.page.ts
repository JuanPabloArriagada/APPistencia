import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
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
    private asignaturasService: AsignaturaService
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
    const granted = await this.requestPermissions(); // Solicita permisos de cámara
    if (!granted) {
      return; 
    }
  
    this.isScanning = true; 
    const { barcodes } = await BarcodeScanner.scan(); // Escanea los códigos de barras
    this.barcodes.push(...barcodes); // Agrega los códigos escaneados al array
  
    for (const barcode of this.barcodes) {
      await this.processScannedValue(barcode.rawValue); // Procesa el valor escaneado
    }
  
    this.isScanning = false; // Finaliza el escaneo
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions(); // Solicita permisos de cámara
    return camera === 'granted' || camera === 'limited';
  }

  async processScannedValue(scannedValue: string) {
    const claseMatch = scannedValue.match(/ClaseId:\s*(\d+)/);
    const asignaturaMatch = scannedValue.match(/Asignatura:\s*([^,]+)/);

    if (claseMatch && claseMatch[1]) {
      this.claseId = claseMatch[1]; // Obtiene el ID de la clase
    } else {
      return; 
    }

    if (asignaturaMatch && asignaturaMatch[1]) {
      this.asignaturaId = asignaturaMatch[1]; // Obtiene el ID de la asignatura
    } else {
      return; 
    }

    const alumnoId = this.route.snapshot.paramMap.get('rut') || '';
    await this.registrarAsistencia(alumnoId, this.asignaturaId); // Registra la asistencia del alumno
  }

  async registrarAsistencia(alumnoId: string, asignaturaId: string) {
    try {
      const clase = await this.asistenciaService.obtenerClase(this.claseId); // Obtiene la clase

      if (!clase) {
        return; // Clase no encontrada
      }

      const asignatura = await this.asignaturasService.obtenerAsignaturaPorId(asignaturaId); // Obtiene la asignatura
      if (!asignatura) {
        return; 
      }

      // Verifica si el alumno ya está registrado en la asistencia
      if (clase.asistentes.includes(alumnoId)) {
        return; 
      }

      // Registra al alumno en la asistencia
      const nuevosAsistentes = [...clase.asistentes, alumnoId];
      const inasistentesActualizados = clase.inasistentes.filter(id => id !== alumnoId);

      await this.asistenciaService.actualizarAsistencia(this.claseId, nuevosAsistentes, inasistentesActualizados); // Actualiza la asistencia

      // Inscripción del alumno en la asignatura si no está inscrito
      if (!asignatura.inscritos.includes(alumnoId)) {
        await this.asignaturasService.inscribirAlumnoEnAsignatura(asignaturaId, alumnoId); // Inscribe al alumno en la asignatura
      }
    } catch (error: any) {
      console.error(`Error al registrar la asistencia: ${error.message || error}`);
    }
  }
}
