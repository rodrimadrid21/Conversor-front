import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataAuthService } from '../../services/data-auth.service';

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suscripciones.component.html',
  styleUrls: ['./suscripciones.component.scss']
})
export class SuscripcionesComponent {

  mensaje: string = '';
  loading: boolean = false;

  constructor(private authService: DataAuthService) {}

  async activar(plan: 'Free' | 'Trial' | 'Pro'): Promise<void> {
    this.mensaje = '';
    this.loading = true;

    try {
      const msg = await this.authService.activarPlan(plan);
      this.mensaje = msg; // "Suscripción actualizada a Trial"
    } catch (error: any) {
      console.error('Error al activar plan:', error);
      if (error.status === 401) {
        this.mensaje = 'Sesión expirada o inválida. Iniciá sesión nuevamente.';
      } else {
        this.mensaje = error.message || 'Error al actualizar la suscripción.';
      }
    } finally {
      this.loading = false;
    }
  }
}
