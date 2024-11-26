import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MenuComponent } from './pages/menu/menu.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { SuscripcionesComponent } from './pages/suscripciones/suscripciones.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ConversionComponent } from './pages/conversion/conversion.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'register',
        component: RegisterComponent,
    },
    {
        path: '',
        component: DashboardComponent,
        //canActivate: [soloLogeadoGuard],  // Solo usuarios logueados
        children: [
            {
                path: 'menu',
                component: MenuComponent
            },
            {
                path: 'conversion',
                component: ConversionComponent
            },
            {
                path: 'historial',
                component: HistorialComponent
            },
            {
                path: 'suscripciones',
                component: SuscripcionesComponent
            }
        ]
    },
    {
        path: 'not-found',
        component: NotFoundComponent
    },
    {
        path: '**',  // Cualquier ruta no definida
        redirectTo: 'not-found',  // Redirigir a la página 404
        pathMatch: 'full'
    }
];
