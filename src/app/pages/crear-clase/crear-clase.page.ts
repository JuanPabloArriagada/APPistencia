import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Asignatura, Horario } from '../../interfaces/asignatura';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicas

@Component({
  selector: 'app-crear-clase',
  templateUrl: './crear-clase.page.html',
  styleUrls: ['./crear-clase.page.scss'],
})
export class CrearClasePage implements OnInit {
  asignatura: Asignatura = {
    id: '',
    nombre: '',
    horarios: [
      { dia: '', horaInicio: '', horaFin: '', codigoSala: '' } 
    ],
    profesorId: ''  // Aquí puedes asignar el ID del profesor actual
  };

  constructor(private asignaturaService: AsignaturaService) { }

  ngOnInit() {}

  // Agregar un nuevo horario
  agregarHorario() {
    this.asignatura.horarios.push({ dia: '', horaInicio: '', horaFin: '', codigoSala: '' });
  }

  // Eliminar un horario
  eliminarHorario(index: number) {
    this.asignatura.horarios.splice(index, 1);
  }

  // Guardar la asignatura con su horario
  async guardarAsignatura() {
    this.asignatura.id = uuidv4(); // Generar ID único para la asignatura
    await this.asignaturaService.guardarAsignatura(this.asignatura);
    console.log('Asignatura guardada:', this.asignatura);
    // Reiniciar el formulario
    this.asignatura = {
      id: '',
      nombre: '',
      horarios: [{ dia: '', horaInicio: '', horaFin: '', codigoSala: '' }],
      profesorId: '' // agregar la logica para obtener el ID del profesor actual
    };
  }
}
