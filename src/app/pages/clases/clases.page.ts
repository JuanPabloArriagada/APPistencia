import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AsignaturaService } from '../../services/asignaturas.service';
import { Usuario } from '../../interfaces/usuario';
import { Asignatura, Clase, Horario } from '../../interfaces/asignatura';

type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

@Component({
  selector: 'app-clases',
  templateUrl: './clases.page.html',
  styleUrls: ['./clases.page.scss'],
})
export class ClasesPage implements OnInit {
  daysOfWeek: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  selectedDay: DayOfWeek | null = null;
  clasesRegistradas: Record<DayOfWeek, { clase: Horario, nombreAsignatura: string }[]> = {
    Lunes: [],
    Martes: [],
    Miércoles: [],
    Jueves: [],
    Viernes: []
  };
  showGenerateQR: boolean = false;
  titulo: string = 'Clases';
  usuarioId: string = '';

  constructor(
    private asignaturaService: AsignaturaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.usuarioId = this.route.snapshot.paramMap.get('rut') || '';
    this.route.data.subscribe(data => {
      this.showGenerateQR = data['showGenerateQR'] || false;
      this.titulo = data['titulo'] || 'Clases';
    });
    await this.cargarClasesPorUsuario();
  }

  hayClasesParaElDia(): boolean {
    return this.selectedDay !== null && this.clasesRegistradas[this.selectedDay]?.length > 0;
  }


  async cargarClasesPorUsuario() {
    const asignaturas = await this.asignaturaService.obtenerAsignaturasPorUsuario(this.usuarioId);
    for (const asignatura of asignaturas) {
      for (const clase of asignatura.horarios) {
        const dia = clase.dia as DayOfWeek;
        if (this.clasesRegistradas[dia]) {
          this.clasesRegistradas[dia].push({ clase, nombreAsignatura: asignatura.nombre });
        }
      }
    }
  }
  

  selectDay(day: DayOfWeek) {
    this.selectedDay = day;
  }

  clearSelection() {
    this.selectedDay = null;
  }

  generarQR() {
    this.router.navigate(['/qr', this.usuarioId]);
  }
}
