import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/auth-service.service'; 
import { Network } from '@capacitor/network'; 
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit, OnDestroy {
  rut: string = '';
  rol: string = '';
  usuarioActual: Usuario | null = null;
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  networkListener: any;
  backButtonListener: any;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService, 
    private platform: Platform
  ) {}

  async ngOnInit() {
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('RUT del usuario:', this.rut);
  
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);
    console.log('Estado de la red al iniciar:', status.connected);
  
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.isOnline$.next(status.connected);
      console.log('Estado de la red cambiado:', status.connected);
    });

    this.backButtonListener = this.platform.backButton.subscribeWithPriority(10, () => {
      console.log('Botón de retroceso bloqueado en el menú');
    });
  
    if (this.rut) {
      if (this.isOnline$.getValue()) {
        try {
          this.authService.getUsuarioActual(this.rut).subscribe(
            async (datos) => {
              if (datos) {
                this.usuarioActual = datos;
                this.rol = datos.rol;
                await this.authService.guardarUsuarioOffline(datos); 
              } else {
                console.warn(`Usuario con rut ${this.rut} no encontrado`);
              }
            },
            async (error) => {
              console.error('Error al cargar datos online:', error);
              this.usuarioActual = await this.authService.getUsuarioActualOffline(this.rut); // Recuperar desde almacenamiento local
              this.rol = this.usuarioActual?.rol || '';
            }
          );
        } catch (error) {
          console.error('Error general:', error);
          this.usuarioActual = await this.authService.getUsuarioActualOffline(this.rut); // Recuperar desde almacenamiento local
          this.rol = this.usuarioActual?.rol || '';
        }
      } else {
        // Si no hay conexión, cargar datos desde almacenamiento local
        this.usuarioActual = await this.authService.getUsuarioActualOffline(this.rut);
        this.rol = this.usuarioActual?.rol || '';
      }
    } else {
      console.warn('RUT no proporcionado en la URL');
      this.platform.backButton.subscribeWithPriority(10, () => {
        console.log('Botón de retroceso deshabilitado');
      });
    }
  }

  getRouterLinkFor(route: string): string | any[] | null {
    const isOnline = this.isOnline$.getValue(); // Obtiene el valor actual de isOnline$
    return isOnline ? [`/${route}`, { rut: this.rut }] : null;
  }
  

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
    if (this.backButtonListener) {
      this.backButtonListener.unsubscribe();
    }
  }
}
