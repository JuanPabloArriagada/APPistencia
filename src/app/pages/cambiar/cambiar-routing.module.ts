import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CambiarPage } from './cambiar.page';

const routes: Routes = [
  {
    path: '',
    component: CambiarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CambiarPageRoutingModule {}
