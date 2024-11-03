import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Asignatura, AsistenciaAsignatura } from '../../interfaces/asignatura';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  rut: string = '';
  asignaturas: AsistenciaAsignatura[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private asignaturaService: AsignaturaService
  ) {}

  async ngOnInit() {
    this.rut = this.route.snapshot.paramMap.get('rut')!;
    this.asignaturas = await this.asignaturaService.obtenerAsignaturasConAsistencias(this.rut);  }

  async cargarAsignaturasConAsistencias() {
    this.asignaturas = await this.asignaturaService.obtenerAsignaturasConAsistencias(this.rut);
    console.log('Asignaturas con datos de asistencia:', this.asignaturas);
  }
}
