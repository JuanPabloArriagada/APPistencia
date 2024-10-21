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

  usuario: Usuario={
    rut:'',
    Nombre:'',
    correo:'',
    rol:'',
    foto:'',
    contrasena:'',
  }

  constructor(
    private router:Router,
    private db:LocalDBService,
  ) { }

  ngOnInit() {
  }

  login(){
    /* Verificar si existe el ususario */
    let buscado = this.db.obtener(this.usuario.rut)
    buscado.then(datos=>{
      if(datos !== null){
        if(datos.rut===this.usuario.rut && datos.contrasena===this.usuario.contrasena){
          this.router.navigate(['/menu' , { rut: this.usuario.rut }])
        }
      }
    })
  }
}