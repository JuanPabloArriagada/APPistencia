import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsignaturasRegistradasPageRoutingModule } from './asignaturas-registradas-routing.module';

import { AsignaturasRegistradasPage } from './asignaturas-registradas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsignaturasRegistradasPageRoutingModule
  ],
  declarations: [AsignaturasRegistradasPage]
})
export class AsignaturasRegistradasPageModule {}
