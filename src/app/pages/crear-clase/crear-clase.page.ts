import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { LocalDBService } from '../../services/dbstorage.service';
import { Asignatura, Horario } from '../../interfaces/asignatura';
import { Usuario } from '../../interfaces/usuario';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';

@Component({
  selector: 'app-crear-clase',
  templateUrl: './crear-clase.page.html',
  styleUrls: ['./crear-clase.page.scss'],
})
export class CrearClasePage implements OnInit {
  asignatura: Asignatura = {
    id: '',
    nombre: '',
    horarios: [{ dia: '', horaInicio: '', horaFin: '', codigoSala: '', asignaturaId: '' }],
    profesorId: '',
    inscritos: [],
    clases: [],
    porcentajeAsistencia: 0
  };

  rut: string = '';
  usuarioActual!: Usuario;  
  successMessage: string = ''; // Nuevo mensaje de éxito

  constructor(
    private asignaturaService: AsignaturaService,
    private Aut: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('RUT del profesor:', this.rut);
    
    this.Aut.getUsuarioActual(this.rut).subscribe(usuario => {
      if (usuario) {
        this.usuarioActual = usuario;
      } else {
        console.warn(`Usuario con rut ${this.rut} no encontrado`);
      }
    });
  }

  agregarHorario() {
    this.asignatura.horarios.push({ dia: '', horaInicio: '', horaFin: '', codigoSala: '', asignaturaId: this.asignatura.id });
  }

  eliminarHorario(index: number) {
    this.asignatura.horarios.splice(index, 1);
  }

  async guardarAsignatura() {
    this.asignatura.id = uuidv4();
    this.asignatura.profesorId = this.usuarioActual.rut;

    this.asignatura.horarios.forEach(horario => {
        horario.asignaturaId = this.asignatura.id; 
    });

    await this.asignaturaService.guardarAsignatura(this.asignatura);

    if (!this.usuarioActual.asignaturasCreadas) {
        this.usuarioActual.asignaturasCreadas = [];
    }
    this.usuarioActual.asignaturasCreadas.push(this.asignatura.id);

 

    // Mostrar mensaje de éxito
    this.successMessage = '¡Asignatura creada con éxito!';
    setTimeout(() => {
      this.successMessage = ''; // Limpiar el mensaje después de 3 segundos
    }, 3000);

    // Reinicia el formulario
    this.asignatura = {
        id: '',
        nombre: '',
        horarios: [{ dia: '', horaInicio: '', horaFin: '', codigoSala: '', asignaturaId: '' }],
        profesorId: '',
        inscritos: [],
        clases: [],
        porcentajeAsistencia: 0
    };
    console.log('Asignatura guardada y registrada en el profesor:', this.asignatura);
  }
}