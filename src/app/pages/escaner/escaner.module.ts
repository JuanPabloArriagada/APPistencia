// escaner.page.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EscanerPageRoutingModule } from './escaner-routing.module';
import { EscanerPage } from './escaner.page';
import { BarcodeScanner } from  
 '@capacitor-mlkit/barcode-scanning';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EscanerPageRoutingModule
  ],
  declarations: [EscanerPage]
})
export class EscanerPageModule  
 {}
