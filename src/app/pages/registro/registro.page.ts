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

  usuario: Usuario={
    rut:'',
    Nombre:'',
    correo:'',
    rol:'',
    foto:'',
    contrasena:'',
  }
  
  constructor(
    private db:LocalDBService,
    private router:Router,
  ) {}

  ngOnInit() {
  }

  registro(){
    /* Validar que no este registrado */
    let buscado=this.db.login(this.usuario.rut)
    buscado.then(datos=>{
      if(datos==null){
        /* Añadir: rut ,nombre,  correo, contraseña a la storage */
        this.db.registro(this.usuario.rut, this.usuario);
        console.log(this.usuario);
        /* Llevar a la pagina de login */
        this.router.navigate(['/home'])
      }
    })
  }
}
