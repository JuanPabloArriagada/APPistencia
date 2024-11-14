import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Asignatura } from '../../interfaces/asignatura';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';

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
    private route: ActivatedRoute,
    private storage: Storage
  ) {}

  async ngOnInit() {
    await this.storage.create();

    // Obtener el rut del parámetro de la URL
    this.rut = this.route.snapshot.paramMap.get('rut') || '';

    const storedAsignaturas = await this.storage.get(`asignaturas-${this.rut}`);
    if (storedAsignaturas) {
      console.log('Asignaturas encontradas en storage:', storedAsignaturas);
      this.asignaturas = storedAsignaturas; 
    } else {
      console.log('No se encontraron asignaturas en storage. Cargando desde servicio...');
      this.cargarAsignaturas(); 
    }
  }

  async actualizarAsignaturas() {
    console.log('Actualizando asignaturas...');
    await this.cargarAsignaturas(); // Recargar las asignaturas desde el servicio
  }
  
  async cargarAsignaturas() {
    try {
      const asignaturas = await this.asignaturaService.obtenerAsignaturasPorProfesor(this.rut);
      console.log('Asignaturas del profesor:', asignaturas);
      this.asignaturas = asignaturas;
  
      // Almacenar las asignaturas en storage para su uso futuro
      await this.storage.set(`asignaturas-${this.rut}`, asignaturas);
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    }
  }

  verClases(asignatura: Asignatura) {
    this.router.navigate(['/clases-registradas', asignatura.id, this.rut]);
  }
}
