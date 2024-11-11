import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClasesRegistradasPageRoutingModule } from './clases-registradas-routing.module';

import { ClasesRegistradasPage } from './clases-registradas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClasesRegistradasPageRoutingModule
  ],
  declarations: [ClasesRegistradasPage]
})
export class ClasesRegistradasPageModule {}
