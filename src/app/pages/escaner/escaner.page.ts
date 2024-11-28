import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AsistenciaService } from '../../services/asistencia.service';
import { OfflineService } from '../../services/offline.service';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';
import { AlertController } from '@ionic/angular';

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
export class EscanerPage implements OnInit, OnDestroy {
  isSupported = false;
  barcodes: Barcode[] = [];
  claseId: string = '';
  isScanning: boolean = false;
  asignaturaId: string = '';
  escaneoData: Escaneo | null = null;
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  networkListener: any;
  rut: string = this.route.snapshot.paramMap.get('rut') || '';

  constructor(
    private route: ActivatedRoute,
    private asistenciaService: AsistenciaService,
    private offlineService: OfflineService,
    private alertController: AlertController,
    private platform: Platform,
    public router: Router
  ) {}

  ngOnInit() {
    this.checkBarcodeScannerSupport();
    this.checkNetworkStatus();
  
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.isOnline$.next(status.connected);
      if (status.connected) {
        this.syncOfflineData(); // Sincronizar datos cuando vuelva la conexión
      } else {
        this.presentAlert('Estás desconectado de Internet. Las asistencias se guardarán localmente.');
      }
    });
  }

  async checkBarcodeScannerSupport() {
    const result = await BarcodeScanner.isSupported();
    this.isSupported = result.supported;

    if (this.isSupported) {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    }
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);
  }

  async scan(): Promise<void> {
    if (!this.isOnline$.getValue()) {
      await this.presentAlert('No hay conexión a internet. Guardando asistencia localmente.');
    }
  
    const granted = await this.requestPermissions();
    if (!granted) {
      await this.presentAlert('Permisos de cámara denegados.');
      return;
    }
  
    this.isScanning = true;
  
    try {
      const { barcodes } = await BarcodeScanner.scan();
      if (barcodes.length === 0) {
        await this.presentAlert('No se escaneó ningún código.');
      } else {
        for (const barcode of barcodes) {
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
    const claseMatch = scannedValue.match(/ClaseId:\s*(\d+)/);
    const alumnoId = this.route.snapshot.paramMap.get('rut') || '';
  
    if (!claseMatch) {
      await this.presentAlert('Código QR inválido.');
      return;
    }
  
    this.claseId = claseMatch[1];
  
    // Verificar si estamos online
    if (this.isOnline$.getValue()) {
      // Verificar si la clase ya existe en Firebase
      const claseExiste = await this.verificarClaseEnFirebase(this.claseId);
  
      if (claseExiste) {
        // Si la clase existe, registrar asistencia directamente
        await this.registrarAsistenciaOnline(alumnoId);
      } else {
        // Si la clase no existe, guardar la asistencia localmente
        await this.offlineService.guardarAsistenciaOffline({
          claseId: this.claseId,
          alumnoId,
          estado: 'presente',  // Este estado puede variar según el caso
        });
        await this.presentAlert('Clase no registrada en Firebase. Asistencia guardada localmente. Se sincronizará cuando la clase esté disponible.');
      }
    } else {
      // Si estamos offline, guardar la asistencia localmente
      await this.offlineService.guardarAsistenciaOffline({
        claseId: this.claseId,
        alumnoId,
        estado: 'presente',
      });
      await this.presentAlert('Estás desconectado. Asistencia guardada localmente. Se sincronizará cuando vuelva la conexión.');
    }
  }

  async registrarAsistenciaOnline(alumnoId: string) {
    try {
      await this.asistenciaService.registrarAsistencia(this.claseId, alumnoId);
      await this.presentAlert('Asistencia registrada exitosamente.');
    } catch (error) {
      console.error('Error al registrar asistencia online:', error);
      await this.presentAlert('Error al registrar la asistencia.');
    }
  }

  async syncOfflineData() {
    const asistenciasSincronizadas: string[] = [];
    
    // Sincronizar las asistencias guardadas localmente
    await this.offlineService.sincronizarAsistenciasOffline(async (asistencia) => {
      try {
        await this.asistenciaService.registrarAsistencia(asistencia.claseId, asistencia.alumnoId);
        asistenciasSincronizadas.push(asistencia.claseId);
      } catch (error) {
        console.error('Error al sincronizar asistencia:', error);
      }
    });
    
    if (asistenciasSincronizadas.length > 0) {
      await this.presentAlert(`¡Conexión restaurada! Se sincronizaron ${asistenciasSincronizadas.length} asistencias.`);
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

  async finalizarRegistro() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Estás seguro de finalizar el registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Finalizar',
          handler: () => {
            this.router.navigate(['/menu', { rut: this.rut }]); // Redirige a la página previa
          },
        },
      ],
    });
  
    await alert.present();
  }

  async verificarClaseEnFirebase(claseId: string): Promise<boolean> {
    try {
      const clase = await this.asistenciaService.obtenerClase(claseId);
      return clase !== null;  // Si la clase existe, devuelve true
    } catch (error) {
      console.error('Error al verificar la clase en Firebase:', error);
      return false;
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}
