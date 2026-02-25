import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DataAuthService } from '../../services/data-auth.service';
import { DataHistorialService } from '../../services/data-historial.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  menu = false;

  plan: 'Free' | 'Trial' | 'Pro' = 'Free';

  private authService = inject(DataAuthService);
  private router = inject(Router);

  async ngOnInit(): Promise<void> {
    // se ejecuta al cargar el dashboard
    await this.loadUsageSummary();

    // Se actualiza automáticamente si cambia el plan
    this.authService.onChange(() => {
      this.loadUsageSummary();
    });
  }

  // pregunta al auth cual es el plan actual
  private async loadUsageSummary(): Promise<void> {
    this.plan = this.authService.getSubscriptionType();
  }

  toggleMenu(): void {
    this.menu = !this.menu; // cuando el usuario haga click en usuario se cambia menu y muestra cerrar sesion
  }

  cerrarSesion(): void {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }
}
