import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AsistenciaService } from '../../services/asistencia.service';
import { Clase } from '../../interfaces/asignatura';
import { AsignaturaService } from '../../services/asignaturas.service';
import { OfflineService } from '../../services/offline.service';
import { Network } from '@capacitor/network';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQRPage implements OnInit {
  qrData: string = '';
  confirmados: string[] = [];
  inasistentes: string[] = [];
  asignaturaId: string = '';
  asignaturaNombre: string = '';
  dia: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  codigoSala: string = '';
  asignaturaInscritos: string[] = [];
  claseIdCreada: string = '';
  totalInscritos: number = 0;
  rut: string = this.route.snapshot.paramMap.get('rut') || '';
  fechaClase: string = new Date().toISOString().split('T')[0]; // Solo 'YYYY-MM-DD'

  constructor(
    private asistenciaService: AsistenciaService,
    private asignaturaService: AsignaturaService,
    private router: Router,
    private route: ActivatedRoute,
    private offlineService: OfflineService,
    private storage: Storage // Asegúrate de tener acceso a storage
  ) {}

  async ngOnInit() {
    await this.storage.create(); // Crear instancia de storage

    this.route.queryParams.subscribe(async params => {
      this.dia = params['dia'] || '';
      this.horaInicio = params['horaInicio'] || '';
      this.horaFin = params['horaFin'] || '';
      this.codigoSala = params['codigoSala'] || '';
      this.asignaturaId = params['asignaturaId'] || '';

      // Intentar obtener la asignatura desde Firebase o Storage
      const asignatura = await this.obtenerAsignatura();

      this.asignaturaNombre = asignatura ? asignatura.nombre : 'Asignatura no encontrada';
      this.asignaturaInscritos = asignatura ? asignatura.inscritos : [];
      await this.crearClase();
      this.suscribirCambiosClase();
      this.subcribirCambiosAsignatura();
    });

    this.sincronizarClases();
    this.sincronizarCuandoOnline();
  }

  // Método para obtener la asignatura
  async obtenerAsignatura() {
    try {
      // Primero intentamos obtenerla desde el servicio
      const asignatura = await this.asignaturaService.obtenerAsignaturaPorId(this.asignaturaId);
      // Si la asignatura se obtiene correctamente, la almacenamos en local
      await this.storage.set(`asignatura-${this.asignaturaId}`, asignatura);
      return asignatura;
    } catch (error) {
      console.warn('Error al obtener asignatura desde Firebase:', error);
      // Si falla, intentamos obtenerla desde el almacenamiento local
      const asignatura = await this.storage.get(`asignatura-${this.asignaturaId}`);
      if (asignatura) {
        console.log('Asignatura obtenida desde almacenamiento local:', asignatura);
        return asignatura;
      } else {
        console.error('Asignatura no encontrada en almacenamiento local');
        return null; // Si no la encuentra en ninguna parte, retorna null
      }
    }
  }

  async sincronizarCuandoOnline() {
    const status = await Network.getStatus();
    if (status.connected) {
      this.sincronizarClases(); // Solo sincroniza cuando haya conexión
    }
  }

  async crearClase() {
    const nuevaClase: Clase = {
      id: Date.now().toString(),  // ID único
      asignaturaId: this.asignaturaId,
      dia: this.dia,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      codigoSala: this.codigoSala,
      asistentes: [],
      inasistentes: [...this.asignaturaInscritos],
      fecha: this.fechaClase
    };

    this.qrData = `ClaseId: ${nuevaClase.id}, Asignatura: ${this.asignaturaId}, NombreAsignatura: ${this.asignaturaNombre}, Día: ${this.dia}, Inicio: ${this.horaInicio}, Fin: ${this.horaFin}, Sala: ${this.codigoSala}`;
    
    try {
      // Verificar el estado de la conexión antes de enviar la clase
      const status = await Network.getStatus();
      if (status.connected) {
        await this.asistenciaService.guardarAsistencia(nuevaClase);  // Enviar a Firebase si hay conexión
      } else {
        console.warn('Sin conexión, guardando en local.');
        await this.offlineService.guardarClaseLocal(nuevaClase);  // Guardar offline si no hay conexión
      }
      this.claseIdCreada = nuevaClase.id;
      this.inasistentes = [...this.asignaturaInscritos];
    } catch (error) {
      console.warn('Error al crear clase:', error);
    }
  }

  async finalizarRegistro() {
    try {
      // Si hay conexión, actualiza los datos en el servidor
      const status = await Network.getStatus();
      if (status.connected) {
        await this.asistenciaService.actualizarAsistencia(this.claseIdCreada, this.confirmados, this.inasistentes);
      } else {
        // Si no hay conexión, guarda los datos en el almacenamiento local
        console.warn('Sin conexión, guardado en local');
      }
      // Redirigir al menú
      this.router.navigate(['/menu', { rut: this.rut }]);
    } catch (error) {
      console.error('Error al finalizar el registro:', error);
    }
  }
  

  suscribirCambiosClase() {
    this.asistenciaService.obtenerClaseEnTiempoReal(this.claseIdCreada).subscribe((data) => {
      if (data) {
        this.confirmados = data.asistentes || [];
        this.inasistentes = this.asignaturaInscritos.filter(inscrito => !this.confirmados.includes(inscrito));
      }
    }, error => {
      console.error('Error al suscribirse a los cambios de la clase:', error);
    });
  }

  subcribirCambiosAsignatura() {
    this.asignaturaService.obtenerAsignaturaEnTiempoReal(this.asignaturaId).subscribe((data) => {
      if (data) {
        this.totalInscritos = data.inscritos.length;
      }
    }, error => {
      console.error('Error al suscribirse a los cambios de la asignatura:', error);
    });
  }

  async sincronizarClases() {
    const clasesNoSincronizadas = await this.offlineService.obtenerClasesNoSincronizadas();
    for (const clase of clasesNoSincronizadas) {
      try {
        await this.asistenciaService.guardarAsistencia(clase);  // Enviar a Firebase
        await this.offlineService.eliminarClaseSincronizada(clase.id);  // Eliminar de local
        console.log('Clase sincronizada:', clase);
      } catch (error) {
        console.error('Error al sincronizar la clase:', error);
      }
    }
  }
}
