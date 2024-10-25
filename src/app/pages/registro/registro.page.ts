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

  registro(){
    /* Validar que no este registrado */
    let buscado=this.db.obtener(this.usuario.rut)
    buscado.then(datos=>{
      this.correo = this.usuario.correo.split("@")[1];
      if(this.correo == "duocuc.cl"){
        this.usuario.rol = "Estudiante"
      }
      else if (this.correo =="profesor.duoc.cl"){
        this.usuario.rol = "Profesor"
      }
      if(datos==null){
        /* Añadir: rut ,nombre,  correo, contraseña a la storage */
        this.db.registro(this.usuario.rut, this.usuario);
        
        /* Llevar a la pagina de login */
        this.router.navigate(['/home'])
      }
    })
  }
}
