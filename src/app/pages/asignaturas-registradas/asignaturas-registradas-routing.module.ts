import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsignaturasRegistradasPage } from './asignaturas-registradas.page';

const routes: Routes = [
  {
    path: '',
    component: AsignaturasRegistradasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsignaturasRegistradasPageRoutingModule {}
