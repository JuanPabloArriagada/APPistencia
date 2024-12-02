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
    }, 2000); // 5 segundos
  }

  async cargarClases() {
    console.log('Cargando clases desde servicio...');
    try {
      const clasesNuevas = await this.asignaturaService.obtenerClasesPorAsignatura(this.asignaturaId);
      console.log('Clases obtenidas del servicio:', clasesNuevas);
      
      // Intentar obtener las clases almacenadas localmente
      const clasesAlmacenadas = await this.storage.get(`clases-${this.asignaturaId}-${this.rut}`);
  
      // Si no hay clases almacenadas, las agregamos todas
      if (!clasesAlmacenadas) {
        this.clases = clasesNuevas;
        await this.storage.set(`clases-${this.asignaturaId}-${this.rut}`, this.clases);
      } else {
        const clasesActualizadas = [...clasesAlmacenadas];
        let actualizo = false;
  
        clasesNuevas.forEach(nuevaClase => {
            const claseExistente: Clase | undefined = clasesAlmacenadas.find((almacenada: Clase) => almacenada.id === nuevaClase.id);
  
          if (!claseExistente) {
            // Si no existe la clase en el almacenamiento, agregarla como nueva
            clasesActualizadas.push(nuevaClase);
            actualizo = true;
          } else {
            // Verificar si hubo cambios en los asistentes o inasistentes
            const asistentesHanCambiado = !this.isSameAttendance(claseExistente, nuevaClase);
  
            if (asistentesHanCambiado) {
              // Si hay un cambio en los asistentes o inasistentes, actualizamos la clase
              const index = clasesActualizadas.indexOf(claseExistente);
              clasesActualizadas[index] = nuevaClase; // Reemplazamos la clase con los nuevos datos
              actualizo = true;
            }
          }
        });
  
        if (actualizo) {
          // Solo actualizamos si hubo un cambio
          this.clases = clasesActualizadas;
          await this.storage.set(`clases-${this.asignaturaId}-${this.rut}`, this.clases);
        }
      }
  
      // Calcular el porcentaje de asistencia luego de actualizar
      this.calcularPorcentajeAsignatura();
    } catch (error) {
      console.error('Error al cargar clases desde servicio:', error);
    }
  }
  
  // Función para comparar si los asistentes e inasistentes son los mismos
  isSameAttendance(clase1: Clase, clase2: Clase): boolean {
    // Comparar el número de asistentes y de inasistentes
    const asistentesIguales = clase1.asistentes.length === clase2.asistentes.length &&
                               clase1.asistentes.every((asistente, index) => asistente === clase2.asistentes[index]);
  
    const inasistentesIguales = clase1.inasistentes.length === clase2.inasistentes.length &&
                                 clase1.inasistentes.every((inasistente, index) => inasistente === clase2.inasistentes[index]);
  
    return asistentesIguales && inasistentesIguales;
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
