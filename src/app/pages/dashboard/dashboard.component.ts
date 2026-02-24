import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { DataAuthService } from '../../services/data-auth.service';
import { DataHistorialService } from '../../services/data-historial.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  menu = false;

  authService = inject(DataAuthService);
  historialService = inject(DataHistorialService);
  router = inject(Router);

  plan: 'Free' | 'Trial' | 'Pro' = 'Free';
  usedConversions = 0;
  limit: number | null = null;
  remaining: number | null = null;

  async ngOnInit(): Promise<void> {
    await this.loadUsageSummary();

    this.authService.onChange(async () => {
      await this.loadUsageSummary();
    });
  }

  toggleMenu(): void {
    this.menu = !this.menu;
  }

  cerrarSesion() {
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  private async loadUsageSummary(): Promise<void> {
    this.plan = this.authService.getSubscriptionType();

    // 1) historial → cuántas usó en 30 días
    const hist = await this.historialService.getHistorial();
    if (hist.ok) {
      const now = new Date();
      const from = new Date();
      from.setDate(now.getDate() - 30);

      this.usedConversions = hist.data.filter(c => {
        if (!c.date) return false;
        const d = new Date(c.date);
        return d >= from && d <= now;
      }).length;
    } else {
      this.usedConversions = 0;
    }

    // 2) límite del plan (si falla, queda null)
    this.limit = await this.authService.getLimitByPlan(this.plan);

    // 3) remaining (si limit es null, no aplica)
    this.remaining = this.limit === null ? null : Math.max(this.limit - this.usedConversions, 0);
  }
}