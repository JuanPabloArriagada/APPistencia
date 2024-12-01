import { Component, OnInit, OnDestroy } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { ActivatedRoute } from '@angular/router';
import { Clase } from '../../interfaces/asignatura';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-clases-registradas',
  templateUrl: './clases-registradas.page.html',
  styleUrls: ['./clases-registradas.page.scss'],
})
export class ClasesRegistradasPage implements OnInit, OnDestroy {
  clases: Clase[] = [];
  asignaturaId: string = ''; 
  rut: string = '';
  porcentajeAsistenciaAsignatura: number = 0;
  refreshInterval: any;

  constructor(
    private asignaturaService: AsignaturaService,
    private route: ActivatedRoute,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();

    this.asignaturaId = this.route.snapshot.paramMap.get('asignaturaId') || '';
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('Asignatura ID obtenido:', this.asignaturaId);

    // Intentar obtener clases desde storage
    const storedClases = await this.storage.get(`clases-${this.asignaturaId}-${this.rut}`);
    if (storedClases) {
      console.log('Clases encontradas en storage:', storedClases);
      this.clases = storedClases;
      this.calcularPorcentajeAsignatura();
    } else {
      console.log('No se encontraron clases en storage. Cargando desde servicio...');
      this.cargarClases();
    }

    // Actualización automática cada 30 segundos
    this.refreshInterval = setInterval(() => {
      this.cargarClases();
    }, 5000); // 5 segundos
  }

  // Cargar las clases desde el servicio
  async cargarClases() {
    console.log('Cargando clases desde servicio...');
    try {
      this.clases = await this.asignaturaService.obtenerClasesPorAsignatura(this.asignaturaId);
      console.log(`Clases cargadas desde servicio:`, this.clases);
      this.calcularPorcentajeAsignatura();
      
      // Almacenar las clases en el storage
      await this.storage.set(`clases-${this.asignaturaId}-${this.rut}`, this.clases);
    } catch (error) {
      console.error('Error al cargar clases desde servicio:', error);
    }
  }

  // Calcular el porcentaje de asistencia de una clase
  calcularPorcentajeClase(clase: Clase): number {
    const totalEstudiantes = clase.asistentes.length + clase.inasistentes.length;
    if (totalEstudiantes === 0) return 0; // Evitar división por cero
    return (clase.asistentes.length / totalEstudiantes) * 100;
  }

  // Calcular el porcentaje de asistencia promedio de la asignatura
  calcularPorcentajeAsignatura(): void {
    let totalPorcentaje = 0;
    let totalClases = 0;
    this.clases.forEach((clase) => {
      if (clase.asignaturaId === this.asignaturaId) {
        totalPorcentaje += this.calcularPorcentajeClase(clase);
        totalClases++;
      }
    });

    if (totalClases > 0) {
      this.porcentajeAsistenciaAsignatura = totalPorcentaje / totalClases;
    } else {
      this.porcentajeAsistenciaAsignatura = 0;
    }
    console.log('Porcentaje de asistencia promedio de la asignatura:', this.porcentajeAsistenciaAsignatura);
  }

  toggleDetalles(clase: Clase) {
    if (!clase.mostrarDetalles) {
      clase.mostrarDetalles = false; 
    }
    clase.mostrarDetalles = !clase.mostrarDetalles; // Alternar visibilidad
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval); // Limpiar el intervalo cuando se destruye el componente
    }
  }
}
