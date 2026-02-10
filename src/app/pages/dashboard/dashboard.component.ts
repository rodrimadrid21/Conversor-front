import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { DataAuthService } from '../../services/data-auth.service';
import { DataConversionService } from '../../services/data-conversion.service';

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
  router = inject(Router);
  private dataConversionService = inject(DataConversionService);

  // 🔹 info de suscripción / uso
  plan: 'Free' | 'Trial' | 'Pro' = 'Free';
  usedConversions: number = 0;
  limit: number | null = null;
  remaining: number | null = null;

  async ngOnInit(): Promise<void> {
    // carga inicial
    await this.loadUsageSummary();

    // 🔥🔥🔥 ESCUCHA CUANDO CAMBIE EL PLAN 🔥🔥🔥
    this.authService.addSubscriptionChangeListener(async () => {
      console.log("🔄 Cambio de plan detectado → recargando Dashboard");
      await this.loadUsageSummary();
    });
  }

  toggleMenu(): void {
    this.menu = !this.menu;
  }

  cerrarSesion(){
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  private async loadUsageSummary(): Promise<void> {
    try {
      this.plan = this.authService.getSubscriptionType();

      const history = await this.dataConversionService.getUltimasConversiones();
      const now = new Date();
      const fromDate = new Date();
      fromDate.setDate(now.getDate() - 30);

      const usedLast30 = history.filter(c => {
        if (!c.date) return false;
        const d = new Date(c.date);
        return d >= fromDate && d <= now;
      }).length;

      this.usedConversions = usedLast30;

      const rawLimit = await this.dataConversionService.getLimitByPlan(this.plan);

      if (rawLimit >= 1_000_000) {
        this.limit = null;
        this.remaining = null;
      } else {
        this.limit = rawLimit;
        this.remaining = Math.max(this.limit - this.usedConversions, 0);
      }

    } catch (e) {
      console.error('Error al cargar resumen de uso (dashboard):', e);
    }
  }
}
