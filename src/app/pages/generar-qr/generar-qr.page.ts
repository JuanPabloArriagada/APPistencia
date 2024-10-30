import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AsistenciaService } from '../../services/asistencia.service';
import { Clase } from '../../interfaces/asignatura';
import { QrCodeModule } from 'ng-qrcode'

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQRPage implements OnInit {
  qrData: string = ''; // Dato para generar el QR
  totalAlumnos: number = 30;
  confirmados: string[] = [];
  inasistentes: string[] = [];
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
  }

  ngOnInit() {
    const usuarioId = this.route.snapshot.paramMap.get('rut') || '';

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
