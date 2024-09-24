import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-horario',
  templateUrl: './horario.page.html',
  styleUrls: ['./horario.page.scss'],
})
export class HorarioPage implements OnInit {

  // Definición de los días de la semana
  diasSemana = ['L', 'M', 'X', 'J', 'V'];
  
  // Clases registradas para cada día
  clasesRegistradas: Record<string, { classCode: string; room: string; startTime: string; endTime: string; }[]> = {
    L: [
      { classCode: 'MAT101', room: 'A101', startTime: '08:00', endTime: '09:30' },
      { classCode: 'FIS201', room: 'B202', startTime: '10:00', endTime: '11:30' },
    ],
    M: [
      { classCode: 'QUI301', room: 'C303', startTime: '08:00', endTime: '09:30' },
    ],
    X: [],
    J: [
      { classCode: 'HIS401', room: 'D404', startTime: '08:00', endTime: '09:30' },
      { classCode: 'ART501', room: 'E505', startTime: '10:00', endTime: '11:30' },
    ],
    V: [],
  };

  selectedDay: string | null = null;

  // Método para seleccionar un día
  selectDay(day: string) {
    this.selectedDay = day;
  }

  ngOnInit() {
  }

}
