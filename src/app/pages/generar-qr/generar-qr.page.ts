import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AsistenciaService } from '../../services/asistencia.service';
import { Clase } from '../../interfaces/asignatura';

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQRPage implements OnInit {
  qrData: string = '';
  totalAlumnos: number = 30;
  confirmados: string[] = [];
  inasistentes: string[] = [];
  asignaturaId: string = '';
  dia: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  codigoSala: string = '';

  constructor(
    private asistenciaService: AsistenciaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.dia = params['dia'] || '';
      this.horaInicio = params['horaInicio'] || '';
      this.horaFin = params['horaFin'] || '';
      this.codigoSala = params['codigoSala'] || '';
      this.asignaturaId = params['asignaturaId'] || '';
      this.crearClase();
    });
    
  }

  async crearClase() {
    const nuevaClase: Clase = {
      id: Date.now().toString(),
      asignaturaId: this.asignaturaId,
      dia: this.dia,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      codigoSala: this.codigoSala,
      asistentes: [],
      inasistentes: []
    };
    try {
      this.qrData = `ClaseId: ${nuevaClase.id}, Asignatura: ${this.asignaturaId}, Día: ${this.dia}, Inicio: ${this.horaInicio}, Fin: ${this.horaFin}, Sala: ${this.codigoSala}`;
      console.log('Datos del QR generados:', this.qrData); // Log para depuración
      await this.asistenciaService.guardarAsistencia(nuevaClase);
      console.log('Clase creada y QR generado:', this.qrData);
    } catch (error) {
      console.error('Error al crear la clase:', error);
    }
  }
  

  registrarAsistencia(alumnoId: string) {
    console.log(`Intentando registrar asistencia para el alumno: ${alumnoId}`);
    const alumno = this.inasistentes.find((nombre) => nombre === alumnoId);
    if (alumno) {
      this.confirmados.push(alumno);
      this.inasistentes = this.inasistentes.filter((nombre) => nombre !== alumno);
      console.log(`Asistencia registrada para el alumno ${alumnoId}`);
    }
  }

  async finalizarRegistro() {
    try {
      await this.asistenciaService.actualizarAsistencia(this.asignaturaId, this.confirmados, this.inasistentes);
      console.log('Registro de asistencia guardado correctamente');
      this.router.navigate(['/menu']);
    } catch (error) {
      console.error('Error al guardar el registro de asistencia:', error);
    }
  }
}
