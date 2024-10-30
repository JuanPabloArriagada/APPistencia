import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BarcodeScanner, ScanResult } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-escaner',
  templateUrl: './escaner.page.html',
  styleUrls: ['./escaner.page.scss'],
})
export class EscanerPage {
  scannedData: string | null = null;

  constructor(private navCtrl: NavController) {}

  async startScan() {
    const result: ScanResult = await BarcodeScanner.scan();
  
    if (result.barcodes.length > 0) {
      for (const barcode of result.barcodes) {
        // Accede al valor del código de barras
        const scannedValue = barcode.rawValue;
  
        console.log('Código de barras escaneado:', scannedValue);
        this.registrarAsistencia(scannedValue);
      }
    } else {
      console.log('No se encontró ningún código de barras');
    }
  }
  

  registrarAsistencia(alumnoId: string) {
    // Aquí debes implementar la lógica para registrar la asistencia
    console.log(`Registrando asistencia para: ${alumnoId}`);
    // ... tu lógica de registro aquí
  }

  finalizeScan() {
    if (this.scannedData) {
      console.log('Escaneo finalizado con datos:', this.scannedData);
      this.navCtrl.back();
    } else {
      console.error('No se ha escaneado ningún código QR.');
    }
  }
}