import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Asignatura, Clase } from '../../interfaces/asignatura';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-clases-registradas',
  templateUrl: './clases-registradas.page.html',
  styleUrls: ['./clases-registradas.page.scss'],
})
export class ClasesRegistradasPage implements OnInit {
  asignaturas: Asignatura[] = [];
  clases: Clase[] = [];
  asignaturaSeleccionada: Asignatura | null = null;
  rut: string = '';

  constructor(private asignaturaService: AsignaturaService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    this.cargarAsignaturas();
  }

  async cargarAsignaturas() {
    try {
      this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorProfesor(this.rut);
      console.log('Asignaturas cargadas:', this.asignaturas);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    }
  }

  async seleccionarAsignatura(asignatura: Asignatura) {
    this.asignaturaSeleccionada = asignatura;
    this.cargarClases(asignatura.id);
  }

  async cargarClases(asignaturaId: string) {
    try {
      this.clases = await this.asignaturaService.obtenerClasesPorAsignatura(asignaturaId);
      console.log(`Clases cargadas para la asignatura ${asignaturaId}:`, this.clases);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    }
  }
}
