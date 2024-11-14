import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { ActivatedRoute } from '@angular/router';
import { Asignatura } from '../../interfaces/asignatura';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network'; 
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
})
export class HorarioPage implements OnInit, OnDestroy {
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  asignaturas: Asignatura[] = [];
  selectedDay: string | null = null;
  clasesRegistradas: Record<string, { nombreAsignatura: string; codigoSala: string; horaInicio: string; horaFin: string }[]> = {};
  usuarioRut: string | null = null;
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true); // Estado de conexión
  networkListener: any;

  constructor(
    private asignaturaService: AsignaturaService,
    private route: ActivatedRoute,
    private storage: Storage 
  ) {}

  async ngOnInit() {
    this.usuarioRut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('RUT del usuario:', this.usuarioRut);

    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);
    console.log('Estado de la red al iniciar:', status.connected);

    // Escuchar cambios en la conexión
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.isOnline$.next(status.connected);
      console.log('Estado de la red cambiado:', status.connected);
    });

    if (this.usuarioRut) {
      await this.cargarAsignaturas();
      this.selectDay(this.diasSemana[0]);
    } else {
      console.warn('RUT de usuario no encontrado en la ruta');
    }
  }

  async cargarAsignaturas() {
    if (this.isOnline$.getValue()) {
      this.asignaturas = await this.asignaturaService.obtenerAsignaturasDelHorarioPorUsuario(this.usuarioRut!);
      
      await this.storage.set(`asignaturas_${this.usuarioRut}`, this.asignaturas);
      
      console.log('Asignaturas cargadas desde la API:', this.asignaturas);
    } else {
      const storedAsignaturas = await this.storage.get(`asignaturas_${this.usuarioRut}`);
      if (storedAsignaturas) {
        this.asignaturas = storedAsignaturas;
        console.log('Asignaturas cargadas desde almacenamiento local:', this.asignaturas);
      }
    }

    // Organizar las clases registradas por día
    this.asignaturas.forEach(asignatura => {
      asignatura.horarios.forEach(clase => {
        if (!this.clasesRegistradas[clase.dia]) {
          this.clasesRegistradas[clase.dia] = [];
        }
        this.clasesRegistradas[clase.dia].push({
          nombreAsignatura: asignatura.nombre,
          codigoSala: clase.codigoSala,
          horaInicio: clase.horaInicio,
          horaFin: clase.horaFin,
        });
      });
    });
    console.log('Clases registradas organizadas por día:', this.clasesRegistradas);
  }

  // Función para seleccionar el día y mostrar las clases correspondientes
  selectDay(day: string) {
    this.selectedDay = day;
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}
