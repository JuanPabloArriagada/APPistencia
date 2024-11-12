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
  porcentajeAsistenciaAsignatura: number = 0; // Nuevo campo para el porcentaje de asistencia de la asignatura.

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
    this.calcularPorcentajeAsignatura(asignatura.id);  // Llamamos al método para calcular el porcentaje de la asignatura
  }

  async cargarClases(asignaturaId: string) {
    try {
      this.clases = await this.asignaturaService.obtenerClasesPorAsignatura(asignaturaId);
      console.log(`Clases cargadas para la asignatura ${asignaturaId}:`, this.clases);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    }
  }

  // Método para calcular el porcentaje de asistencia de una clase.
  calcularPorcentajeClase(clase: Clase): number {
    const totalEstudiantes = clase.asistentes.length + clase.inasistentes.length;
    if (totalEstudiantes === 0) return 0; // Evitar división por cero
    return (clase.asistentes.length / totalEstudiantes) * 100;
  }

  // Método para calcular el porcentaje de asistencia promedio de la asignatura.
  calcularPorcentajeAsignatura(asignaturaId: string): void {
    let totalPorcentaje = 0;
    let totalClases = 0;

    this.clases.forEach((clase) => {
      if (clase.asignaturaId === asignaturaId) {
        totalPorcentaje += this.calcularPorcentajeClase(clase);
        totalClases++;
      }
    });

    if (totalClases > 0) {
      this.porcentajeAsistenciaAsignatura = totalPorcentaje / totalClases;
    } else {
      this.porcentajeAsistenciaAsignatura = 0;
    }
  }
}
