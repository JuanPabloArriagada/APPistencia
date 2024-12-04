import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isDarkMode = false; // Variable para almacenar el estado actual del tema

  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Detectar las preferencias del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.isDarkMode = prefersDark.matches;

      // Aplicar el tema según las preferencias del sistema
      document.body.classList.toggle('dark', this.isDarkMode);
      document.body.classList.toggle('light', !this.isDarkMode);

      // Escuchar cambios en tiempo real de las preferencias del sistema
      prefersDark.addEventListener('change', (event) => {
        this.isDarkMode = event.matches;
        this.applyTheme();
      });

      // Restaurar la preferencia guardada del usuario, si existe
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark';
        this.applyTheme();
      }
    });
  }

  toggleDarkMode() {
    // Alternar entre modos manualmente
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();

    // Guardar la preferencia del usuario
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  applyTheme() {
    // Aplicar el tema basado en el estado actual
    document.body.classList.toggle('dark', this.isDarkMode);
    document.body.classList.toggle('light', !this.isDarkMode);
  }
}
