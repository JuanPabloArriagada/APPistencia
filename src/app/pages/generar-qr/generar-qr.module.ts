import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GenerarQRPageRoutingModule } from './generar-qr-routing.module';

import { GenerarQRPage } from './generar-qr.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GenerarQRPageRoutingModule
  ],
  declarations: [GenerarQRPage]
})
export class GenerarQRPageModule {}
