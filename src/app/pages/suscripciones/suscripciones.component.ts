import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataAuthService } from '../../services/data-auth.service';

type Plan = 'Free' | 'Trial' | 'Pro';

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.scss'],
})
export class SuscripcionesComponent {
  mensaje = '';
  loading = false;

  private authService = inject(DataAuthService);

  async activar(plan: Plan): Promise<void> {
    this.mensaje = '';
    this.loading = true;

    try {
      this.mensaje = await this.authService.activarPlan(plan);
    } catch (error: any) {
      this.mensaje = error?.message ?? 'Error inesperado.';
    } finally {
      this.loading = false;
    }
  }
}
