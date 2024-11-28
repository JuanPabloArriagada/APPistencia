import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Usuario } from '../../interfaces/usuario';
import { Asignatura, Clase, Horario } from '../../interfaces/asignatura';

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
    private router: Router
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
      const asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario(this.usuarioId);
      console.log('Asignaturas cargadas:', asignaturas);  // Verificar los datos de asignaturas
      for (const asignatura of asignaturas) {
        for (const clase of asignatura.horarios) {
          const dia = clase.dia as DayOfWeek;
          clase.asignaturaId = asignatura.id;  // Agregar el id de la asignatura a la clase
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
