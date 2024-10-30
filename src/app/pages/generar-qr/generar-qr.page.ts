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
  qrData: string = ''; // Dato para generar el QR
  totalAlumnos: number;
  confirmados: string[] = [];
  inasistentes: string[] = [];
  alumnosFaltantes: string[] = []; // Nueva propiedad agregada
  asignaturaId: string;
  dia: string; 
  horaInicio: string; 
  horaFin: string; 
  codigoSala: string; 

  constructor(
    private asistenciaService: AsistenciaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.asignaturaId = ''; 
    this.dia = ''; 
    this.horaInicio = ''; 
    this.horaFin = ''; 
    this.codigoSala = ''; 
    this.totalAlumnos = 30;  
  }

  ngOnInit() {
    // Obtener el usuarioId de los parámetros de ruta
    const usuarioId = this.route.snapshot.paramMap.get('rut') || '';

    // Obtener los queryParams
    this.route.queryParams.subscribe(params => {
      this.dia = params['dia'] || '';
      this.horaInicio = params['horaInicio'] || '';
      this.horaFin = params['horaFin'] || '';
      this.codigoSala = params['codigoSala'] || '';
      this.asignaturaId = params['asignaturaId'] || '';

      // Generar el dato para el QR
      this.qrData = `Asignatura: ${this.asignaturaId}, Día: ${this.dia}, Inicio: ${this.horaInicio}, Fin: ${this.horaFin}, Sala: ${this.codigoSala}`;
    });
  }

  registrarAsistencia(alumnoId: string) {
    const alumno = this.inasistentes.find((nombre) => nombre === alumnoId);
    if (alumno) {
      this.confirmados.push(alumno);
      this.inasistentes = this.inasistentes.filter((nombre) => nombre !== alumno);
    }
  }

  async finalizarRegistro() {
    const nuevaClase: Clase = {
      id: Date.now().toString(),
      asignaturaId: this.asignaturaId,
      dia: this.dia,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
      codigoSala: this.codigoSala,
      asistentes: this.confirmados,
      inasistentes: this.inasistentes,
    };

    await this.asistenciaService.guardarAsistencia(nuevaClase);
    console.log('Registro de asistencia guardado');
    this.router.navigate(['/menu']);
  }
}
