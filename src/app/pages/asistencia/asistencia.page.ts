import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

interface Subject {
  name: string;
  attendance: number;
  absences: number;
}

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage {
  subjects: Subject[] = [
    { name: 'Matemáticas', attendance: 20, absences: 2 },
    { name: 'Historia', attendance: 18, absences: 4 },
    { name: 'Ciencias', attendance: 19, absences: 3 },
    { name: 'Lengua', attendance: 21, absences: 1 },
  ];

  constructor(private navCtrl: NavController) {}

}