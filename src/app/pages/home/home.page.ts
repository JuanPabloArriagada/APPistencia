import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth-service.service';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errorMessage: string = '';
  isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  networkListener: any;

  // Agregado: Propiedad y lógica para modo oscuro
  isDarkMode = false;

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
    // Verificar el estado de red
    const status = await Network.getStatus();
    this.isOnline$.next(status.connected);

    // Escuchar cambios de red
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.isOnline$.next(status.connected);
    });

    // Lógica de inicialización para el tema oscuro
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    this.isDarkMode = prefersDark.matches;

    // Restaurar preferencia del usuario (si existe)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }

    // Aplicar el tema inicial
    this.applyTheme();

    // Escuchar cambios en las preferencias del sistema
    prefersDark.addEventListener('change', (event) => {
      this.isDarkMode = event.matches;
      this.applyTheme();
    });
  }

  async login() {
    if (!this.loginForm.valid) {
      this.errorMessage = 'Formulario no válido.';
      return;
    }
  
    const { correo, contrasena, rut } = this.loginForm.value;
  
    if (this.isOnline$.value) {
      try {
        // Intentar iniciar sesión online
        const usuario = await this.authService.login(correo, contrasena, rut);
        if (usuario) {
          console.log('Inicio de sesión exitoso online.');
          this.router.navigate(['/menu', { rut: usuario.rut }]);
        }
      } catch (error) {
        this.errorMessage = (error as any).message;
      }
    } else {
      // Intentar inicio de sesión offline
      const offlineUser = await this.authService.getUsuarioActualOffline(rut);
      if (!offlineUser) {
        // Caso: Usuario no registrado localmente
        this.errorMessage = 'Usuario no registrado en el modo offline.';
      } else if (offlineUser.correo !== correo) {
        // Caso: Credenciales incorrectas
        this.errorMessage = 'Credenciales incorrectas para el modo offline.';
      } else {
        // Caso: Inicio de sesión exitoso
        console.log('Inicio de sesión exitoso offline.');
        this.router.navigate(['/menu', { rut: offlineUser.rut }]);
      }
    }
  }

  get isOnline() {
    return this.isOnline$.getValue();
  }

  // Métodos para manejar el tema oscuro
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();

    // Guardar la preferencia del usuario
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  applyTheme() {
    document.body.classList.toggle('dark', this.isDarkMode);
    document.body.classList.toggle('light', !this.isDarkMode);
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}
