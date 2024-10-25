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
  rut: string = '';
  rol: string = '';
  usuarioActual: Usuario | null = null;

  constructor(
    private route: ActivatedRoute,
    private db: LocalDBService
  ) {}

  async ngOnInit() {
    // Recoger el parámetro de la ruta
    this.rut = this.route.snapshot.paramMap.get('rut') || '';

    if (this.rut) {
      const datos = await this.db.obtenerUsuarioPorRut(this.rut);
      if (datos) {
        this.usuarioActual = datos;
        this.rol = datos.rol;
      } else {
        console.warn(`Usuario con rut ${this.rut} no encontrado`);
      }
    } else {
      console.warn('RUT no proporcionado en la URL');
    }
  }
}
