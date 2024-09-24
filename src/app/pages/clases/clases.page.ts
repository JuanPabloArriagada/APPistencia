import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';

@Component({
  selector: 'app-clases',
  templateUrl: './clases.page.html',
  styleUrls: ['./clases.page.scss'],
})
export class ClasesPage implements OnInit {

  selectedDay: DayOfWeek | null = null;

  // Este objeto debe ser llenado con las clases registradas
  clasesRegistradas: Record<DayOfWeek, { classCode: string; room: string; startTime: string; endTime: string; }[]> = {
    Lunes: [
      { classCode: 'CL101', room: 'A1', startTime: '09:00', endTime: '10:30' },
      { classCode: 'CL102', room: 'B1', startTime: '11:00', endTime: '12:30' },
    ],
    Martes: [
      { classCode: 'CL201', room: 'A2', startTime: '09:00', endTime: '10:30' },
    ],
    Miércoles: [
      { classCode: 'CL301', room: 'C1', startTime: '13:00', endTime: '14:30' },
    ],
    Jueves: [],
    Viernes: [],
  };

  selectDay(day: DayOfWeek) {
    this.selectedDay = day;
  }

  clearSelection() {
    this.selectedDay = null;
  }

  showGenerateQR: boolean = false;
  titulo: string = 'Clases';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    // Lee el parámetro de la ruta
    this.route.data.subscribe(data => {
      this.showGenerateQR = data['showGenerateQR'] || false;
      this.titulo = data['titulo'] || 'Clases';
    });
  }
  generarQR() {
    this.router.navigate(['/generar-qr']);
  }
}
