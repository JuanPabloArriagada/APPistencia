import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CambiarPageRoutingModule } from './cambiar-routing.module';

import { CambiarPage } from './cambiar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CambiarPageRoutingModule
  ],
  declarations: [CambiarPage]
})
export class CambiarPageModule {}
