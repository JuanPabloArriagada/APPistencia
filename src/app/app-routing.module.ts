import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';  // AuthGuard para proteger rutas

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'menu',
    loadChildren: () => import('./pages/menu/menu.module').then(m => m.MenuPageModule),
    //canActivate: [AuthGuard] 
  },
  {
    path: 'perfil',
    loadChildren: () => import('./pages/perfil/perfil.module').then(m => m.PerfilPageModule),
    //canActivate: [AuthGuard] 
  },
  {
    path: 'crear-clase',
    loadChildren: () => import('./pages/crear-clase/crear-clase.module').then(m => m.CrearClasePageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'clases',
    loadChildren: () => import('./pages/clases/clases.module').then(m => m.ClasesPageModule),
    data: { titulo: 'Clases' },
    //canActivate: [AuthGuard]
  },
  {
    path: 'crear-qr',
    loadChildren: () => import('./pages/clases/clases.module').then(m => m.ClasesPageModule),
    data: { showGenerateQR: true , titulo: 'Generar QR' },
    //canActivate: [AuthGuard]
  },
  {
    path: 'generar-qr/:rut',
    loadChildren: () => import('./pages/generar-qr/generar-qr.module').then(m => m.GenerarQRPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'horario',
    loadChildren: () => import('./pages/horario/horario.module').then(m => m.HorarioPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'asistencia',
    loadChildren: () => import('./pages/asistencia/asistencia.module').then(m => m.AsistenciaPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'escaner',
    loadChildren: () => import('./pages/escaner/escaner.module').then(m => m.EscanerPageModule),
    //canActivate: [AuthGuard]
  },
  {
    path: 'recuperar',
    loadChildren: () => import('./pages/recuperar/recuperar.module').then(m => m.RecuperarPageModule),
  
  },
  {
    path: 'verificar',
    loadChildren: () => import('./pages/verificar/verificar.module').then(m => m.VerificarPageModule)
  },
  {
    path: 'cambiar',
    loadChildren: () => import('./pages/cambiar/cambiar.module').then(m => m.CambiarPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then(m => m.RegistroPageModule)
  },
  {
    path: 'asignaturas-registradas',
    loadChildren: () => import('./pages/asignaturas-registradas/asignaturas-registradas.module').then( m => m.AsignaturasRegistradasPageModule)
  },
  {
    path: 'clases-registradas/:asignaturaId/:rut',
    loadChildren: () => import('./pages/clases-registradas/clases-registradas.module').then( m => m.ClasesRegistradasPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
