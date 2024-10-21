import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/interfaces/usuario';
import { LocalDBService } from 'src/app/services/dbstorage.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  rut:string = "";
  rol: string = "";
  usr: Usuario[] = [];

  constructor(
    private route: ActivatedRoute,
    private db:LocalDBService,
  ) {}

  ngOnInit() {
    // Recoger el parámetro de la ruta
    this.rut = this.route.snapshot.paramMap.get('rut') || ''; 

    /* Busca al usuario */
    let buscado = this.db.obtener(this.rut)
    buscado.then(datos =>{
      this.rol = (datos.rol)
    })
    }
  }

