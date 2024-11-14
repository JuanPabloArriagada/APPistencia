import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Forzar el modo claro siempre en el navegador
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
      //forzar modo claro en cualquier dispositivo
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    });
  }
}
