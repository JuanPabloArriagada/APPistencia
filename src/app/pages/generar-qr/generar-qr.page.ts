import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AsistenciaService } from '../../services/asistencia.service';
import { Clase } from '../../interfaces/asignatura';
import { AsignaturaService } from '../../services/asignaturas.service';

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQRPage implements OnInit {
  qrData: string = '';
  confirmados: string[] = [];
  inasistentes: string[] = [];
  asignaturaId: string = '';
  asignaturaNombre: string = '';
  dia: string = '';
  horaInicio: string = '';
  horaFin: string = '';
  codigoSala: string = '';
  asignaturaInscritos: string[] = [];
  claseIdCreada: string = '';
  totalInscritos: number = 0;
  rut: string = this.route.snapshot.paramMap.get('rut') || '';
  fechaClase: string = new Date().toISOString(); // Fecha de la clase en formato ISO que es la que se guarda en Firestore
                                                // el formato ISO es: 'YYYY-MM-DDTHH:mm:ss.sssZ'

  constructor(
    private asistenciaService: AsistenciaService,
    private asignaturaService: AsignaturaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async params => {
      this.dia = params['dia'] || '';
      this.horaInicio = params['horaInicio'] || '';
      this.horaFin = params['horaFin'] || '';
      this.codigoSala = params['codigoSala'] || '';
      this.asignaturaId = params['asignaturaId'] || '';

      const asignatura = await this.asignaturaService.obtenerAsignaturaPorId(this.asignaturaId);
      this.asignaturaNombre = asignatura ? asignatura.nombre : 'Asignatura no encontrada';
      this.asignaturaInscritos = asignatura ? asignatura.inscritos : [];
      await this.crearClase();
      this.suscribirCambiosClase();
      this.subcribirCambiosAsignatura();
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
      inasistentes: [...this.asignaturaInscritos] ,
      fecha: this.fechaClase
    };

    this.qrData = `ClaseId: ${nuevaClase.id}, Asignatura: ${this.asignaturaId}, NombreAsignatura: ${this.asignaturaNombre}, Día: ${this.dia}, Inicio: ${this.horaInicio}, Fin: ${this.horaFin}, Sala: ${this.codigoSala}`;

    try {
      await this.asistenciaService.guardarAsistencia(nuevaClase);
      this.claseIdCreada = nuevaClase.id;
      this.inasistentes = [...this.asignaturaInscritos];
    } catch (error) {
      console.error('Error al crear la clase:', error);
    }
  }

  async finalizarRegistro() {
    try {
      await this.asistenciaService.actualizarAsistencia(this.claseIdCreada, this.confirmados, this.inasistentes);
      this.router.navigate(['/menu', { rut: this.rut }]);
    } catch (error) {
      console.error('Error al guardar el registro de asistencia:', error);
    }
  }

  suscribirCambiosClase() {
    this.asistenciaService.obtenerClaseEnTiempoReal(this.claseIdCreada).subscribe((data) => {
      if (data) {
        this.confirmados = data.asistentes || [];
        this.inasistentes = this.asignaturaInscritos.filter(inscrito => !this.confirmados.includes(inscrito));
      }
    }, error => {
      console.error('Error al suscribirse a los cambios de la clase:', error);
    });
  }

  subcribirCambiosAsignatura() {
    this.asignaturaService.obtenerAsignaturaEnTiempoReal(this.asignaturaId).subscribe((data) => {
      if (data) {
        this.totalInscritos = data.inscritos.length;
      }
    }, error => {
      console.error('Error al suscribirse a los cambios de la asignatura:', error);
    });
  }
}
