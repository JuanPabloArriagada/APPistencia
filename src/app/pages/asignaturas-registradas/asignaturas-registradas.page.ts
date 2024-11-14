import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Asignatura } from '../../interfaces/asignatura';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asignaturas-registradas',
  templateUrl: './asignaturas-registradas.page.html',
  styleUrls: ['./asignaturas-registradas.page.scss'],
})
export class AsignaturasRegistradasPage implements OnInit {
  asignaturas: Asignatura[] = [];
  rut: string = ''; // Almacenar el rut del profesor

  constructor(
    private asignaturaService: AsignaturaService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtener el rut del parámetro de la URL
    this.rut = this.route.snapshot.paramMap.get('rut') || ''; 
    this.cargarAsignaturas();
  }

  async cargarAsignaturas() {
    try {
      // Obtener las asignaturas para el profesor con el rut específico
      this.asignaturas = await this.asignaturaService.obtenerAsignaturasPorProfesor(this.rut);
      console.log('Asignaturas del profesor:', this.asignaturas);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    }
  }

  verClases(asignatura: Asignatura) {
    // Navegar a la página de clases, pasando el id de la asignatura y el rut del profesor
    this.router.navigate(['/clases-registradas', asignatura.id, this.rut]);
  }
}
