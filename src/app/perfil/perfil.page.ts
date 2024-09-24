import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

 profile = {
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    rut: '12.345.678-9',
    role: 'Estudiante', // Puede ser 'Estudiante' o 'Profesor'
    imageUrl: 'https://via.placeholder.com/150', // URL de la imagen de perfil
  };

  constructor(private navCtrl: NavController) {}

  // Método para cerrar el perfil
  closeProfile() {
    // Aquí puedes agregar la lógica para cerrar la sesión o redirigir a otra página
    console.log('Perfil cerrado');
  }

  // Método para volver atrás
  goBack() {
    this.navCtrl.back();
  }

  ngOnInit() {
  }
}

