import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Asignatura } from '../../interfaces/asignatura';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-asignaturas-registradas',
  templateUrl: './asignaturas-registradas.page.html',
  styleUrls: ['./asignaturas-registradas.page.scss'],
})
export class AsignaturasRegistradasPage implements OnInit, OnDestroy {
  asignaturas: Asignatura[] = [];
  rut: string = '';
  refreshInterval: any;

  constructor(
    private asignaturaService: AsignaturaService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();

    // Obtener el rut del parámetro de la URL
    this.rut = this.route.snapshot.paramMap.get('rut') || '';

    // Verificar si hay asignaturas almacenadas localmente
    let storedAsignaturas = await this.storage.get(`asignaturas-${this.rut}`);
    if (storedAsignaturas && storedAsignaturas.length > 0) {
      console.log('Asignaturas encontradas en storage:', storedAsignaturas);
      this.asignaturas = storedAsignaturas;
    } else {
      console.log('No se encontraron asignaturas en storage. Cargando desde servicio...');
      this.cargarAsignaturas();
    }

    // Actualización automática cada 30 segundos (ajustado a 1 segundo para pruebas)
    this.refreshInterval = setInterval(() => {
      this.cargarAsignaturas();
    }, 1000); // 1 segundo

    // Detectar cambios en la red (online/offline)
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        console.log('Conectado a la red, sincronizando asignaturas...');
        await this.sincronizarAsignaturas();
      }
    });
  }

  // Cargar las asignaturas desde el servicio (Firebase)
  async cargarAsignaturas() {
    const status = await Network.getStatus();
    if (status.connected) {
      console.log('Cargando asignaturas desde el servidor...');
      try {
        const asignaturas = await this.asignaturaService.obtenerAsignaturasPorProfesor(this.rut);
        console.log('Asignaturas del profesor desde el servidor:', asignaturas);
        
        // Primero obtenemos las asignaturas guardadas en storage
        let storedAsignaturas = await this.storage.get(`asignaturas-${this.rut}`);
        // Si ya existen asignaturas en storage, las combinamos evitando duplicados
        if (storedAsignaturas && storedAsignaturas.length > 0) {
          // Filtramos las asignaturas del servidor para evitar duplicados
          asignaturas.forEach((asignatura: Asignatura) => {
            const exists = storedAsignaturas.some((stored: Asignatura) => stored.id === asignatura.id);
            if (!exists) {
              storedAsignaturas.push(asignatura); // Solo agregamos las nuevas asignaturas
            }
          });
        } else {
          storedAsignaturas = asignaturas; // Si no hay asignaturas guardadas, usamos las del servidor
        }
  
        // Almacenamos las asignaturas combinadas sin duplicados
        this.asignaturas = storedAsignaturas;
        await this.storage.set(`asignaturas-${this.rut}`, storedAsignaturas);
      } catch (error) {
        console.error('Error al cargar asignaturas desde el servidor:', error);
      }
    } else {
      console.log('No hay conexión a la red, mostrando asignaturas desde el almacenamiento local...');
      const storedAsignaturas = await this.storage.get(`asignaturas-${this.rut}`);
      if (storedAsignaturas) {
        this.asignaturas = storedAsignaturas;
      }
    }
  }

  // Sincronizar asignaturas locales con el servidor cuando se esté en línea
  async sincronizarAsignaturas() {
    const asignaturasLocales = await this.storage.get(`asignaturas-${this.rut}`);
    if (asignaturasLocales && asignaturasLocales.length > 0) {
      try {
        await this.asignaturaService.sincronizarAsignaturas(asignaturasLocales);
        console.log('Asignaturas sincronizadas con éxito');
        // Recargar asignaturas del servidor después de la sincronización
        this.cargarAsignaturas();
      } catch (error) {
        console.error('Error al sincronizar asignaturas:', error);
      }
    }
  }

  // Crear una nueva asignatura
  async crearAsignatura(asignatura: Asignatura) {
    let storedAsignaturas = await this.storage.get(`asignaturas-${this.rut}`);
    if (!storedAsignaturas) {
      storedAsignaturas = [];
    }
  
    storedAsignaturas.push(asignatura);
    await this.storage.set(`asignaturas-${this.rut}`, storedAsignaturas);
  
    // Verificar si estamos en línea para sincronizar
    const status = await Network.getStatus();
    if (status.connected) {
      await this.asignaturaService.sincronizarAsignaturas([asignatura]);
      console.log('Asignatura sincronizada con el servidor');
      this.cargarAsignaturas();
    } else {
      console.log('Asignatura guardada localmente (offline)');
      this.asignaturas = storedAsignaturas; // Actualizar la UI con la nueva asignatura
    }
  }

  verClases(asignatura: Asignatura) {
    this.router.navigate(['/clases-registradas', asignatura.id, this.rut]);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval); // Limpiar el intervalo cuando se destruye el componente
    }
  }
}
