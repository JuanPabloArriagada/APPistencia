import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { LocalDBService } from '../../services/dbstorage.service';
import { Asignatura } from '../../interfaces/asignatura';
import { Usuario } from '../../interfaces/usuario';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
})
export class HorarioPage implements OnInit {
  diasSemana = ['L', 'M', 'X', 'J', 'V'];
  asignaturas: Asignatura[] = [];
  selectedDay: string | null = null;
  clasesRegistradas: Record<string, { codigoSala: string; horaInicio: string; horaFin: string }[]> = {};

  usuarioActual: Usuario | null = null;

  constructor(
    private asignaturaService: AsignaturaService,
    private db: LocalDBService
  ) {}

  async ngOnInit() {
    // Obtener el usuario actual usando LocalDBService
    this.usuarioActual = await this.db.obtenerUsuarioPorRut('12345678-9'); // Usa el RUT correcto aquí

    if (this.usuarioActual) {
      await this.cargarAsignaturas();
      this.selectDay('L');
    } else {
      console.warn('Usuario no encontrado');
    }
  }

  async cargarAsignaturas() {
    if (this.usuarioActual) {
      this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario(this.usuarioActual.rut);
      
      this.asignaturas.forEach(asignatura => {
        asignatura.horarios.forEach(clase => {
          if (!this.clasesRegistradas[clase.dia]) {
            this.clasesRegistradas[clase.dia] = [];
          }
          this.clasesRegistradas[clase.dia].push({
            codigoSala: clase.codigoSala,
            horaInicio: clase.horaInicio,
            horaFin: clase.horaFin,
          });
        });
      });
    }
  }

  selectDay(day: string) {
    this.selectedDay = day;
  }
}
