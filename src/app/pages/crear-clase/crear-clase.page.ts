import { Component, OnInit, ViewChild } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { LocalDBService } from '../../services/dbstorage.service';
import { Asignatura, Horario } from '../../interfaces/asignatura';
import { Usuario } from '../../interfaces/usuario';
import { v4 as uuidv4 } from 'uuid';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { AuthService } from '../../services/auth-service.service';
import { OfflineService } from 'src/app/services/offline.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-crear-clase',
  templateUrl: './crear-clase.page.html',
  styleUrls: ['./crear-clase.page.scss'],
})
export class CrearClasePage implements OnInit {

  step: number = 1; // Control del paso actual del formulario

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
  @ViewChild('asignaturaForm') asignaturaForm!: NgForm;

  constructor(
    private asignaturaService: AsignaturaService,
    private offlineService: OfflineService,
    private Aut: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

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
    this.step = 1; // Restaurar el paso actual del formulario
  }

  nextStep() {
    if (this.step < 3) {
      this.step++;
      ;
    }
  }
  
  previousStep() {
    if (this.step > 1) {
      this.step--;
    }
  }


  agregarHorario() {
    this.asignatura.horarios.push({ dia: '', horaInicio: '', horaFin: '', codigoSala: '', asignaturaId: this.asignatura.id });
  }

  eliminarHorario(index: number) {
    this.asignatura.horarios.splice(index, 1);
  }

  async guardarAsignatura() {
    if (!this.asignaturaForm.valid) {
      return;  // Asegura que el formulario sea válido antes de guardar
    }
    this.asignatura.id = uuidv4();
    this.asignatura.profesorId = this.rut;
    this.asignatura.horarios.forEach(horario => {
      horario.asignaturaId = this.asignatura.id;
    });
  
    // Guardar asignatura localmente si está offline
    const status = await Network.getStatus();
    if (!status.connected) {
      await this.offlineService.guardarAsignaturaLocal(this.asignatura);
      console.log('Asignatura guardada localmente debido a falta de conexión');
    } else {
      await this.asignaturaService.guardarAsignatura(this.asignatura);
      console.log('Asignatura guardada en Firebase');
    }
  
    // Mostrar mensaje de éxito con animación
    this.successMessage = '¡Asignatura creada con éxito!';
    setTimeout(() => {
      // Ocultar mensaje después de 3 segundos
      this.successMessage = ''; 
      // Redirigir al menú después de que desaparezca el mensaje
      this.router.navigate(['/menu', { rut: this.rut }]);
    }, 3000);
  
    // Restablecer el formulario
    this.asignatura = {
      id: '',
      nombre: '',
      horarios: [{ dia: '', horaInicio: '', horaFin: '', codigoSala: '', asignaturaId: '' }],
      profesorId: '',
      inscritos: [],
      clases: [],
      porcentajeAsistencia: 0
    };
  }
  
}
