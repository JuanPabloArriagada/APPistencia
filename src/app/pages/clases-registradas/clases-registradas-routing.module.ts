import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClasesRegistradasPage } from './clases-registradas.page';

const routes: Routes = [
  {
    path: '',
    component: ClasesRegistradasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClasesRegistradasPageRoutingModule {}
