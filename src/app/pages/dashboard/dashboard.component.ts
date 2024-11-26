import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { DataAuthService } from '../../services/data-auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  menu = false;
  authService = inject(DataAuthService);
  router = inject(Router);
  toggleMenu(): void {
    this.menu = !this.menu;
  }

  cerrarSesion(){
  this.authService.clearToken();
  this.router.navigate(['/login']);
  }
}
