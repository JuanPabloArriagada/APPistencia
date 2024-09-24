import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'menu',
    loadChildren: () => import('./menu/menu.module').then( m => m.MenuPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('./perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'crear-clase',
    loadChildren: () => import('./crear-clase/crear-clase.module').then( m => m.CrearClasePageModule)
  },
  {
    path: 'clases',
    loadChildren: () => import('./generarQr/clases/clases.module').then( m => m.ClasesPageModule)
  },
  {
    path: 'generar-qr',
    loadChildren: () => import('./generarQr/generar-qr/generar-qr.module').then( m => m.GenerarQRPageModule)
  },
  {
    path: 'horario',
    loadChildren: () => import('./horario/horario.module').then( m => m.HorarioPageModule)
  },
  {
    path: 'asistencia',
    loadChildren: () => import('./asistencia/asistencia.module').then( m => m.AsistenciaPageModule)
  },
  {
    path: 'escaner',
    loadChildren: () => import('./Escanearqr/escaner/escaner.module').then( m => m.EscanerPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
