import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Clase } from '../../interfaces/asignatura';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-clases-registradas',
  templateUrl: './clases-registradas.page.html',
  styleUrls: ['./clases-registradas.page.scss'],
})
export class ClasesRegistradasPage implements OnInit {
  clases: Clase[] = [];
  asignaturaId: string = ''; // Aquí almacenamos el ID de la asignatura
  rut: string = '';
  porcentajeAsistenciaAsignatura: number = 0;

  constructor(
    private asignaturaService: AsignaturaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener el ID de la asignatura desde la ruta
    this.asignaturaId = this.route.snapshot.paramMap.get('asignaturaId') || '';
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('Asignatura ID obtenido:', this.asignaturaId); // Depurar el ID de la asignatura

    // Cargar las clases asociadas a la asignatura
    if (this.asignaturaId) {
      this.cargarClases(this.asignaturaId);
    }
  }

  // Cargar las clases de la asignatura seleccionada
  async cargarClases(asignaturaId: string) {
    console.log('Cargando clases para la asignatura con ID:', asignaturaId); // Depurar el momento de carga de las clases
    try {
      this.clases = await this.asignaturaService.obtenerClasesPorAsignatura(asignaturaId);
      console.log(`Clases cargadas para la asignatura ${asignaturaId}:`, this.clases); // Verificar que las clases fueron cargadas
      this.calcularPorcentajeAsignatura(asignaturaId);  // Calcular el porcentaje de asistencia de la asignatura
    } catch (error) {
      console.error('Error al cargar clases:', error);
    }
  }

  // Calcular el porcentaje de asistencia de una clase
  calcularPorcentajeClase(clase: Clase): number {
    const totalEstudiantes = clase.asistentes.length + clase.inasistentes.length;
    if (totalEstudiantes === 0) return 0; // Evitar división por cero
    return (clase.asistentes.length / totalEstudiantes) * 100;
  }

  // Calcular el porcentaje de asistencia promedio de la asignatura
  calcularPorcentajeAsignatura(asignaturaId: string): void {
    let totalPorcentaje = 0;
    let totalClases = 0;
    console.log('Calculando porcentaje de asistencia para asignatura ID:', asignaturaId); // Depurar la asignatura actual
    this.clases.forEach((clase) => {
      console.log('Clase actual:', clase); // Verificar cada clase en el cálculo
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
    console.log('Porcentaje de asistencia promedio de la asignatura:', this.porcentajeAsistenciaAsignatura); // Verificar el porcentaje calculado
  }

  // Alternar la visibilidad de los detalles de la clase
  toggleDetalles(clase: Clase) {
    console.log('Toggle detalles de clase:', clase); // Verificar el toggle de detalles
    if (!clase.mostrarDetalles) {
      clase.mostrarDetalles = false; // Inicializar si no existe la propiedad
    }
    clase.mostrarDetalles = !clase.mostrarDetalles; // Alternar visibilidad
  }
}
