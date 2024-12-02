import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Usuario } from '../../interfaces/usuario';
import { Asignatura, Clase, Horario } from '../../interfaces/asignatura';
import { Storage } from '@ionic/storage-angular';


type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

@Component({
  selector: 'app-clases',
  templateUrl: './clases.page.html',
  styleUrls: ['./clases.page.scss'],
})
export class ClasesPage implements OnInit {
  daysOfWeek: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  selectedDay: DayOfWeek | null = null;
  selectedClase: Horario | null = null; // Para almacenar la clase seleccionada
  clasesRegistradas: Record<DayOfWeek, { clase: Horario, nombreAsignatura: string }[]> = {
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: []
  };
  showGenerateQR: boolean = false;
  titulo: string = 'Clases';
  usuarioId: string = '';

  constructor(
    private asignaturaService: AsignaturaService,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage
  ) {}

  async ngOnInit() {
    this.usuarioId = this.route.snapshot.paramMap.get('rut') || '';
    console.log('RUT del usuario:', this.usuarioId);
    this.route.data.subscribe(data => {
      this.showGenerateQR = data['showGenerateQR'] || false;
      this.titulo = data['titulo'] || 'Clases';
    });
    await this.cargarClasesPorUsuario();
  }

  // Verifica si hay clases registradas para el día seleccionado por el usuario y retorna un valor booleano
  hayClasesParaElDia(): boolean {
    return this.selectedDay !== null && this.clasesRegistradas[this.selectedDay]?.length > 0;
  }

  async cargarClasesPorUsuario() {
    try {
      await this.storage.create();  // Asegúrate de que Storage esté inicializado
  
      // Intentar cargar las asignaturas del almacenamiento local
      let asignaturas = await this.storage.get(`asignaturas-${this.usuarioId}`);
      if (!asignaturas || asignaturas.length === 0) {
        console.log('Asignaturas no encontradas en storage. Cargando desde servicio...');
        asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario(this.usuarioId);
        // Guardar las asignaturas en el almacenamiento local para futuras consultas
        await this.storage.set(`asignaturas-${this.usuarioId}`, asignaturas);
      } else {
        console.log('Asignaturas cargadas desde storage:', asignaturas);
      }
  
      // Procesar las asignaturas y clases
      for (const asignatura of asignaturas) {
        for (const clase of asignatura.horarios) {
          const dia = clase.dia as DayOfWeek;
          clase.asignaturaId = asignatura.id; // Agregar ID de la asignatura
          if (this.clasesRegistradas[dia]) {
            this.clasesRegistradas[dia].push({ clase, nombreAsignatura: asignatura.nombre });
          }
        }
      }
    } catch (error) {
      console.error('Error cargando clases:', error);
    }
  }

  selectDay(day: DayOfWeek) {
    this.selectedDay = day;
  }

  selectClase(clase: Horario) {
    this.selectedClase = clase;
    console.log('Clase seleccionada:', clase); // Para depurar
  }

  clearSelection() {
    this.selectedDay = null;
    this.selectedClase = null; // Limpiar clase seleccionada
  }

  generarQR() {
    if (this.selectedClase && this.selectedDay) {
      const { horaInicio, horaFin, codigoSala, asignaturaId } = this.selectedClase;
      this.router.navigate(['/generar-qr', this.usuarioId], {
        queryParams: {
          dia: this.selectedDay,  // Usar el día seleccionado aquí
          horaInicio: horaInicio,
          horaFin: horaFin,
          codigoSala: codigoSala,
          asignaturaId: asignaturaId
        }
      });
    } else {
      console.error('No se ha seleccionado ninguna clase o día para generar QR.');
    }
  }
}
