import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generar-qr',
  templateUrl: './generar-qr.page.html',
  styleUrls: ['./generar-qr.page.scss'],
})
export class GenerarQRPage implements OnInit {

  userType: String='Docente';
  // Datos de ejemplo
  totalAlumnos: number = 30;  // Total de alumnos
  confirmados: number = 20;    // Alumnos confirmados
  inasistentes: number = 10;   // Alumnos inasistentes
  alumnosFaltantes: string[] = ['Juan Pérez', 'María López', 'Pedro Gómez']; // Lista de alumnos que faltan por escanear

  constructor(private router:Router){}
  // Método para finalizar el registro
  finalizarRegistro() {
    // Aquí puedes implementar la lógica para finalizar el registro
    this.router.navigate(['/menu', { userType: this.userType }])
    console.log('Registro finalizado');
  }

  ngOnInit() {
  }

}
