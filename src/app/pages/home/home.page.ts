import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network'; // Importar Network
import { BehaviorSubject } from 'rxjs'; // Importar BehaviorSubject

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string = '';
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true); // Estado de conexión como observable
  networkListener: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private storage: Storage
  ) {
    this.loginForm = new FormGroup({
      correo: new FormControl('', [Validators.required, Validators.email]),
      contrasena: new FormControl('', [Validators.required]),
      rut: new FormControl('', [Validators.required]),
    });
  }

  async ngOnInit() {
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected); 
    console.log('Estado de la red al iniciar:', status.connected);

    // Escuchar cambios en la conexión
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.isOnline$.next(status.connected);
      console.log('Estado de la red cambiado:', status.connected);
    });

    try {
      console.log('Verificando usuario almacenado en storage...');
      const storedUser = await this.storage.get('usuario');
  
      if (storedUser) {
        console.log('Usuario encontrado en storage:', storedUser);
        this.router.navigate(['/menu', { rut: storedUser.rut }]); // Redirigir si ya hay un usuario
      } else {
        console.log('No se encontró usuario en storage');
      }
    } catch (error) {
      console.error('Error al verificar usuario en storage', error);
    }
  }

  async login() {
    console.log('Formulario de login: ', this.loginForm.value);
  
    if (!this.loginForm.valid) {
      console.log('Formulario no válido');
      return; // Si el formulario no es válido, no hacer nada
    }
  
    const { correo, contrasena, rut } = this.loginForm.value;
  
    try {
      console.log('Intentando login con correo:', correo);
  
      const usuario = await this.authService.login(correo, contrasena, rut);
  
      if (usuario && usuario.rut === rut && usuario.correo === correo) {
        console.log('Login exitoso');
        this.router.navigate(['/menu', { rut: usuario.rut }]);
      } else {
        this.errorMessage = 'El correo, el RUT o la contraseña no coinciden.';
      }
    } catch (error) {
      console.error('Credenciales incorrectas', error);
      this.errorMessage = 'Credenciales incorrectas. Intenta nuevamente.';
    }
  }

  get isOnline() {
    return this.isOnline$.getValue();
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}
