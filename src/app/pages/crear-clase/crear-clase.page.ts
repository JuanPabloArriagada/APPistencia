import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crear-clase',
  templateUrl: './crear-clase.page.html',
  styleUrls: ['./crear-clase.page.scss'],
})
export class CrearClasePage implements OnInit {
  classData = {
    classCode: '',
    sectionCode: '',
    studentCount: null,
    sessions: [
      {
        room: '',
        day: '',
        startTime: '',
        endTime: '',
      },
    ],
  };

  constructor() {}

  addSession() {
    this.classData.sessions.push({
      room: '',
      day: '',
      startTime: '',
      endTime: '',
    });
  }

  removeSession(index: number) {
    this.classData.sessions.splice(index, 1);
  }

  onSubmit() {
    console.log('Clase creada:', this.classData);
  }

  ngOnInit() {
  }

}
