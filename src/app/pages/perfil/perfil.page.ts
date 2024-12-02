import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Usuario } from '../../interfaces/usuario';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit, OnDestroy {
  perfilForm: FormGroup;
  usuario: Usuario | null = null;
  rut: string = '';
  editMode = false; 
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true); 

  networkListener: any;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      Nombre: ['', Validators.required],
    });
  }

  async ngOnInit() {
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);

    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.isOnline$.next(status.connected);
    });

    this.rut = this.route.snapshot.paramMap.get('rut') || '';

    if (this.rut) {
      if (this.isOnline$.getValue()) {
        this.authService.getUsuarioActual(this.rut).subscribe((usuario) => {
          if (usuario) {
            this.usuario = usuario;
            this.perfilForm.patchValue({
              Nombre: usuario.Nombre,
            });
          }
        });
      } else {
        this.usuario = await this.authService.getUsuarioActualOffline(this.rut);
        if (this.usuario) {
          this.perfilForm.patchValue({
            Nombre: this.usuario.Nombre,
          });
        }
      }
    }
  }

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
    if (this.isOnline$.getValue()) {
      this.authService.logout().then(() => {
        this.router.navigate(['/home']);
      });
    } else {
      console.log('Cierre de sesión realizado sin conexión');
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}
