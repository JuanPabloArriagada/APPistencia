import { Component, OnInit } from '@angular/core';
import { LocalDBService } from '../../services/dbstorage.service';
import { Usuario } from '../../interfaces/usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  usuario: Usuario = {
    rut: '',
    Nombre: '',
    correo: '',
    rol: '',
    foto: '',
    contrasena: '',
  };

  constructor(
    private db: LocalDBService,
    private router: Router
  ) {}

  ngOnInit() {}

  async registro() {
    const buscado = await this.db.obtenerUsuarioPorRut(this.usuario.rut);
  
    if (!buscado) {
      // Asignar rol según el dominio del correo
      const correoDominio = this.usuario.correo.split("@")[1];
      this.usuario.rol = correoDominio === "duocuc.cl" ? "Estudiante" : 
                         correoDominio === "profesor.duoc.cl" ? "Profesor" : 
                         "Desconocido";
  
      await this.db.registro(this.usuario);
      this.router.navigate(['/home']);
    } else {
      console.log('Usuario ya registrado');
    }
  }
}
