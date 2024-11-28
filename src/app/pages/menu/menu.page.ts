import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/auth-service.service';
import { OfflineService } from 'src/app/services/offline.service'; // Servicio para asistencias offline
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';
import { AsistenciaService } from 'src/app/services/asistencia.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit, OnDestroy {
  rut: string = '';
  rol: string = '';
  usuarioActual: Usuario | null = null;
  backButtonListener: any;
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  networkListener: any;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private offlineService: OfflineService,
    private platform: Platform,
    private alertController: AlertController,
    private asistenciaService: AsistenciaService
  ) {}

  async ngOnInit() {
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('RUT del usuario:', this.rut);

    // Cargar datos del usuario
    if (this.rut) {
      try {
        this.authService.getUsuarioActual(this.rut).subscribe(
          async (datos) => {
            if (datos) {
              this.usuarioActual = datos;
              this.rol = datos.rol;
            } else {
              console.warn(`Usuario con rut ${this.rut} no encontrado`);
            }
          },
          async (error) => {
            console.error('Error al cargar datos online:', error);
            // Recuperar desde almacenamiento local
            this.usuarioActual = await this.authService.getUsuarioActualOffline(this.rut);
            this.rol = this.usuarioActual?.rol || '';
          }
        );
      } catch (error) {
        console.error('Error general:', error);
        // Recuperar desde almacenamiento local
        this.usuarioActual = await this.authService.getUsuarioActualOffline(this.rut);
        this.rol = this.usuarioActual?.rol || '';
      }
    } else {
      console.warn('RUT no proporcionado en la URL');
    }

    // Configurar el listener de red
    this.checkNetworkStatus();
    this.networkListener = Network.addListener('networkStatusChange', async (status) => {
      this.isOnline$.next(status.connected);
      if (status.connected) {
        await this.syncOfflineData();
      }
    });

    // Bloquear el botón de retroceso en esta página
    this.backButtonListener = this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Botón de retroceso bloqueado en el menú');
    });
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);
    if (status.connected) {
      await this.syncOfflineData();
    }
  }

  async syncOfflineData() {
    const asistenciasSincronizadas: string[] = [];
    const clasesSincronizadas: string[] = [];
  
    // Sincronizar asistencias offline
    await this.offlineService.sincronizarAsistenciasOffline(async (asistencia) => {
      await this.asistenciaService.registrarAsistencia(asistencia.claseId, asistencia.alumnoId);
      asistenciasSincronizadas.push(asistencia.claseId);
    });
  
    // Sincronizar clases offline
    const clasesNoSincronizadas = await this.offlineService.obtenerClasesNoSincronizadas();
    for (const clase of clasesNoSincronizadas) {
      try {
        await this.asistenciaService.guardarAsistencia(clase); // Guardar clase en el servidor
        await this.offlineService.eliminarClaseSincronizada(clase.id); // Eliminar clase del almacenamiento local
        clasesSincronizadas.push(clase.id);
      } catch (error) {
        console.error('Error al sincronizar la clase:', error);
      }
    }
  
    // Mostrar alerta de sincronización
    if (asistenciasSincronizadas.length > 0) {
      await this.presentAlert(`¡Conexión restaurada! Se sincronizaron ${asistenciasSincronizadas.length} asistencias correctamente.`);
    }
    if (clasesSincronizadas.length > 0) {
      await this.presentAlert(`¡Conexión restaurada! Se sincronizaron ${clasesSincronizadas.length} clases correctamente.`);
    }
  
    if (asistenciasSincronizadas.length === 0 && clasesSincronizadas.length === 0) {
      console.log('No hay datos para sincronizar.');
    }
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Sincronización',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  ngOnDestroy() {
    if (this.backButtonListener) {
      this.backButtonListener.unsubscribe();
    }
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}
