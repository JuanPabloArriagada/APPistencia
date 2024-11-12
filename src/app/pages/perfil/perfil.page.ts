import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from '../../interfaces/usuario';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  perfilForm: FormGroup;
  usuario: Usuario | null = null;
  rut: string = '';
  editMode = false; // Variable para controlar el modo de edición

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Configurar el formulario de perfil
    this.perfilForm = this.fb.group({
      Nombre: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Obtener el RUT de los parámetros de la ruta
    this.rut = this.route.snapshot.paramMap.get('rut') || '';

    // Cargar datos del usuario
    this.authService.getUsuarioActual(this.rut).subscribe((usuario) => {
      if (usuario) {
        this.usuario = usuario;
        this.perfilForm.patchValue({
          Nombre: usuario.Nombre,
        });
      }
    });
  }

  // Método para alternar el modo de edición
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode && this.usuario) {
      this.perfilForm.patchValue({
        Nombre: this.usuario.Nombre,
      });
    }
  }

  // Método para guardar los cambios
  async guardarCambios() {
    if (this.perfilForm.valid && this.usuario) {
      // Actualizar los datos del usuario con los valores del formulario
      const datosActualizados = {
        ...this.usuario,
        ...this.perfilForm.value,
      };
      await this.authService.actualizarUsuario(this.rut, datosActualizados);
      alert('Perfil actualizado exitosamente');
      this.editMode = false; // Volver a modo solo lectura después de guardar
    }
  }

  // Método para cerrar sesión
  cerrarSesion() {
    this.authService.logout().then(() => {
      this.router.navigate(['/home']); // Redirige a la página de inicio de sesión
    });
  }
}
