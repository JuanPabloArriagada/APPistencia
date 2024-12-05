import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-detalle-estudiante',
  templateUrl: './detalle-estudiante.page.html',
  styleUrls: ['./detalle-estudiante.page.scss'],
})
export class DetalleEstudiantePage implements OnInit {
  rut: string = '';
  asignaturaId: string = '';
  nombreEstudiante: string = '';
  porcentajeAsistencia: number = 0;
  datosGrafico: any = [];
  clasesAsistidas: any[] = [];
  clasesInasistidas: any[] = [];
  totalClases: number = 0;

  constructor(
    private route: ActivatedRoute,
    private asignaturaService: AsignaturaService,
    private authService: AuthService,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    this.asignaturaId = this.route.snapshot.paramMap.get('asignaturaId') || '';
    this.obtenerDetallesEstudiante();
    this.checkNetworkStatus();
  }

  obtenerNombreEstudiante(rut: string) {
    this.authService.buscarUsuarioPorRut(rut).subscribe((usuario: { Nombre: string } | null) => {
      this.nombreEstudiante = usuario ? usuario.Nombre : 'Nombre no disponible';
    });
  }

  async obtenerDetallesEstudiante() {
    this.obtenerNombreEstudiante(this.rut);

    const status = await Network.getStatus();
    if (status.connected) {
      // Si estamos en línea, obtenemos los datos desde el servidor
      this.asignaturaService.obtenerClasesPorAsignatura(this.asignaturaId).then((clases) => {
        this.totalClases = clases.length;
        this.clasesAsistidas = [];
        this.clasesInasistidas = [];

        let clasesAsistidas = 0;
        clases.forEach((clase) => {
          if (clase.asistentes.includes(this.rut)) {
            clasesAsistidas++;
            this.clasesAsistidas.push(clase);
          } else {
            this.clasesInasistidas.push(clase);
          }
        });

        this.porcentajeAsistencia = this.totalClases > 0 ? (clasesAsistidas / this.totalClases) * 100 : 0;

        // Prepara los datos para el gráfico
        this.datosGrafico = [
          { name: 'Asistidas', value: clasesAsistidas },
          { name: 'No asistidas', value: this.totalClases - clasesAsistidas },
        ];

        // Guardamos las clases en el almacenamiento local para trabajar en modo offline
        this.storage.set(`clases-${this.asignaturaId}-${this.rut}`, clases);
      });
    } else {
      // Si estamos offline, intentamos cargar los datos desde el almacenamiento local
      const storedClases = await this.storage.get(`clases-${this.asignaturaId}-${this.rut}`);
      if (storedClases) {
        this.totalClases = storedClases.length;
        this.clasesAsistidas = [];
        this.clasesInasistidas = [];

        let clasesAsistidas = 0;
        storedClases.forEach((clase: any) => {
          if (clase.asistentes.includes(this.rut)) {
            clasesAsistidas++;
            this.clasesAsistidas.push(clase);
          } else {
            this.clasesInasistidas.push(clase);
          }
        });

        this.porcentajeAsistencia = this.totalClases > 0 ? (clasesAsistidas / this.totalClases) * 100 : 0;

        // Prepara los datos para el gráfico
        this.datosGrafico = [
          { name: 'Asistidas', value: clasesAsistidas },
          { name: 'No asistidas', value: this.totalClases - clasesAsistidas },
        ];
      } else {
        console.log('No hay datos disponibles localmente.');
      }
    }
  }

  async checkNetworkStatus() {
    Network.addListener('networkStatusChange', async (status) => {
      if (status.connected) {
        console.log('Conectado a la red, sincronizando datos...');
        await this.obtenerDetallesEstudiante();
      } else {
        console.log('Desconectado de la red, trabajando en modo offline...');
      }
    });
  }
}
