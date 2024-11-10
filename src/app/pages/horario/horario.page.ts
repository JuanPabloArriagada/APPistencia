import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Asignatura } from '../../interfaces/asignatura';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
})
export class HorarioPage implements OnInit {
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  asignaturas: Asignatura[] = [];
  selectedDay: string | null = null;
  clasesRegistradas: Record<string, { nombreAsignatura: string; codigoSala: string; horaInicio: string; horaFin: string }[]> = {};
  usuarioRut: string | null = null;

  constructor(
    private asignaturaService: AsignaturaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    // Obtener RUT del usuario de la ruta
    this.usuarioRut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('RUT del usuario:', this.usuarioRut);

    if (this.usuarioRut) {
      await this.cargarAsignaturas();
      this.selectDay(this.diasSemana[0]);
    } else {
      console.warn('RUT de usuario no encontrado en la ruta');
    }
  }

  async cargarAsignaturas() {
    if (this.usuarioRut) {
      this.asignaturas = await this.asignaturaService.obtenerAsignaturasDelHorarioPorUsuario(this.usuarioRut);
      
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
      console.log('Asignaturas cargadas en la página de horario:', this.asignaturas);
      console.log('Clases registradas organizadas por día:', this.clasesRegistradas);
    }
  }

  // Función para seleccionar el día y mostrar las clases correspondientes
  selectDay(day: string) {
    this.selectedDay = day;
  }
}
