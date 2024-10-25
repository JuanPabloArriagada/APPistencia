import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalDBService } from '../../services/dbstorage.service';
import { Usuario } from 'src/app/interfaces/usuario';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  usuario: Usuario = {
    rut: '',
    Nombre: '',
    correo: '',
    rol: '',
    foto: '',
    contrasena: '',
  };

  constructor(
    private router: Router,
    private db: LocalDBService
  ) {}

  ngOnInit() {}

  async login() {
    const datos = await this.db.obtenerUsuarioPorRut(this.usuario.rut);

    if (datos && datos.contrasena === this.usuario.contrasena) {
      this.router.navigate(['/menu', { rut: this.usuario.rut }]);
    } else {
      console.log('Credenciales incorrectas');
    }
  }
}
