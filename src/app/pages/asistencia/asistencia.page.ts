import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';
import { AsistenciaAsignatura } from '../../interfaces/asignatura';
import { BehaviorSubject } from 'rxjs';
import { Network } from '@capacitor/network'; 
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit, OnDestroy {
  rut: string = '';
  asignaturas: AsistenciaAsignatura[] = [];
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true); // Estado de conexión
  networkListener: any;

  constructor(
    private route: ActivatedRoute,
    private asignaturaService: AsignaturaService,
    private storage: Storage 
  ) {}

  async ngOnInit() {
    this.rut = this.route.snapshot.paramMap.get('rut')!;
    
    // Escuchar el estado de la red
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);
    console.log('Estado de la red al iniciar:', status.connected);

    // Escuchar cambios en la conexión
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.isOnline$.next(status.connected);
      console.log('Estado de la red cambiado:', status.connected);
    });

    await this.cargarAsignaturasConAsistencias();
  }

  async cargarAsignaturasConAsistencias() {
    if (this.isOnline$.getValue()) {
      this.asignaturas = await this.asignaturaService.obtenerAsignaturasConAsistencias(this.rut);
      
      await this.storage.set(`asignaturas_asistencia_${this.rut}`, this.asignaturas);
      console.log('Asignaturas con asistencia cargadas desde la API:', this.asignaturas);
    } else {
      // Si no hay conexión, cargar desde el almacenamiento local
      const storedAsignaturas = await this.storage.get(`asignaturas_asistencia_${this.rut}`);
      if (storedAsignaturas) {
        this.asignaturas = storedAsignaturas;
        console.log('Asignaturas con asistencia cargadas desde almacenamiento local:', this.asignaturas);
      }
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}
