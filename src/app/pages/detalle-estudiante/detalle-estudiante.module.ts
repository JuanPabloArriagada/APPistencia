import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalleEstudiantePageRoutingModule } from './detalle-estudiante-routing.module';

import { DetalleEstudiantePage } from './detalle-estudiante.page';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalleEstudiantePageRoutingModule,
    NgxChartsModule
  ],
  declarations: [DetalleEstudiantePage]
})
export class DetalleEstudiantePageModule {}
