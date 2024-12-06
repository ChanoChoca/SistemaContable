import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {CuentaListComponent} from "./cuenta-list/cuenta-list.component";
import {AsientoFormComponent} from "./asiento-list/asiento-form/asiento-form.component";
import {authorityRouteAccess} from "./core/auth/authority-route-access";
import {CuentaFormComponent} from "./cuenta-list/cuenta-form/cuenta-form.component";
import {AsientoListComponent} from "./asiento-list/asiento-list.component";
import {LibroDiarioComponent} from "./libro-diario/libro-diario.component";
import {LibroMayorComponent} from "./libro-mayor/libro-mayor.component";

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'cuentas',
    component: CuentaListComponent,
  },
  {
    path: 'cuenta/new',
    component: CuentaFormComponent,
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROL_ADMIN"]
    }
  },
  {
    path: 'cuenta/edit/:id',
    component: CuentaFormComponent,
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROL_ADMIN"] // Requiere el rol de admin para acceder
    }
  },
  {
    path: 'asientos',
    component: AsientoListComponent
  },
  {
    path: 'asiento/new',
    component: AsientoFormComponent,
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROL_ADMIN"] // Requiere el rol de admin para acceder
    }
  },
  {
    path: 'asiento/edit/:id',
    component: AsientoFormComponent,
    canActivate: [authorityRouteAccess],
    data: {
      authorities: ["ROL_ADMIN"] // Requiere el rol de admin para acceder
    }
  },
  {
    path: 'libro-diario',
    component: LibroDiarioComponent
  },
  {
    path: 'libro-mayor',
    component: LibroMayorComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
