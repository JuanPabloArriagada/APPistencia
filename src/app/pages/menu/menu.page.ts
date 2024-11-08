import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/auth-service.service'; // Importar AuthService

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
    private authService: AuthService // Inyectar AuthService
  ) {}

  async ngOnInit() {
    // Recoger el parámetro de la ruta
    this.rut = this.route.snapshot.paramMap.get('rut') || '';
    console.log('RUT del usuario:', this.rut);
  
    if (this.rut) {
      // Obtener el usuario actual desde AuthService
      this.authService.getUsuarioActual(this.rut).subscribe((datos) => {
        if (datos) {
          this.usuarioActual = datos;
          this.rol = datos.rol;
        } else {
          console.warn(`Usuario con rut ${this.rut} no encontrado en AuthService`);
        }
      });
    } else {
      console.warn('RUT no proporcionado en la URL');
    }
  }
}
