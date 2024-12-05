import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalleEstudiantePage } from './detalle-estudiante.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleEstudiantePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalleEstudiantePageRoutingModule {}
