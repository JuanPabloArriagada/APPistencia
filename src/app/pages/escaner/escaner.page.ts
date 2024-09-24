import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.page.html',
  styleUrls: ['./escaner.page.scss'],
})
export class EscanerPage implements OnInit {

  scannedData: string | null = null;

  constructor(private navCtrl: NavController) {}

  simulateScan() {
    this.scannedData = "Datos del código QR: Clase 101, Profesor: Juan Pérez";
  }

  finalizeScan() {
    if (this.scannedData) {
      console.log('Escaneo finalizado con datos:', this.scannedData);
      this.navCtrl.back();
    } else {
      console.error('No se ha escaneado ningún código QR.');
    }
  }

  ngOnInit() {
  }

}
