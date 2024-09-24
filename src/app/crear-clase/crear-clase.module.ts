import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CrearClasePageRoutingModule } from './crear-clase-routing.module';

import { CrearClasePage } from './crear-clase.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CrearClasePageRoutingModule
  ],
  declarations: [CrearClasePage]
})
export class CrearClasePageModule {}
