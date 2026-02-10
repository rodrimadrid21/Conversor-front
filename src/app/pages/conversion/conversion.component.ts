import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataConversionService } from '../../services/data-conversion.service';
import { DataAuthService } from '../../services/data-auth.service';
import { Conversion } from '../../interfaces/conversion';

@Component({
  selector: 'app-conversion',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss']
})
export class ConversionComponent implements OnInit {

  // Objeto que se enviará al backend (usa la interface en camelCase)
  conversionRequest: Conversion = {
    conversionId: 0,
    usuarioId: 0,          // lo completamos desde el token
    fromCurrency: '',
    toCurrency: '',
    amount: 0,
    // Opcionales:
    fromCurrencySymbol: undefined,
    toCurrencySymbol: undefined,
    result: 0,
    date: undefined
  };

  conversionResult: any = null;
  errorMessage: string = '';

  // 🔹 info de suscripción / uso
  plan: 'Free' | 'Trial' | 'Pro' = 'Free';
  usedConversions: number = 0;       // usadas últimos 30 días
  limit: number | null = null;       // 10, 100 o null (Pro)
  remaining: number | null = null;   // restantes o null (Pro)

  private dataConversionService = inject(DataConversionService);
  private authService = inject(DataAuthService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.getUserId();
    await this.loadUsageSummary();
  }

  // 🔹 Submit del form / botón "Convertir"
  async performConversion(event: Event): Promise<void> {
    event.preventDefault();

    this.errorMessage = '';
    this.conversionResult = null;

    // Fecha de la conversión
    this.conversionRequest.date = new Date().toISOString();

    // Símbolos: por ahora usamos el mismo código que la moneda
    this.conversionRequest.fromCurrencySymbol = this.conversionRequest.fromCurrency;
    this.conversionRequest.toCurrencySymbol = this.conversionRequest.toCurrency;

    // El backend calcula el result real
    this.conversionRequest.result = 0;
    this.conversionRequest.conversionId = 0;

    try {
      const result = await this.dataConversionService.performConversion(this.conversionRequest);

      if (result.ok) {
        const response = result.data;

        // según tu controlador:
        // return Ok(new { conversion = result, history = conversions });
        this.conversionResult = response.conversion ?? response.Conversion ?? response;

        // refrescamos contador/plan
        await this.loadUsageSummary();
      } else {
        // ✅ Manejo UI controlado (sin "romper")
        if (result.status === 403) {
          this.errorMessage = result.message || 'Has alcanzado el límite de conversiones de tu suscripción.';
        } else if (result.status === 401) {
          this.errorMessage = 'Sesión inválida o expirada. Iniciá sesión de nuevo.';
        } else {
          this.errorMessage = result.message || 'Error inesperado al realizar la conversión.';
        }

        // opcional: igual refrescar el contador
        await this.loadUsageSummary();
      }

      this.cdr.detectChanges();
    } catch (error: any) {
      // Esto debería quedar solo para casos raros (sin token, error de red, etc.)
      console.error('Error en performConversion (componente):', error);
      this.errorMessage = error?.message || 'Error inesperado.';
      this.cdr.detectChanges();
    }
  }

  // 🔹 Obtener userId desde el token (el back igual lo puede leer del JWT)
  private async getUserId(): Promise<void> {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('No se encontró el token en localStorage');
      return;
    }

    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const decodedToken = JSON.parse(decodedPayload);

      if (decodedToken.sub) {
        this.conversionRequest.usuarioId = Number(decodedToken.sub);
        console.log('UsuarioId tomado del token:', this.conversionRequest.usuarioId);
      } else {
        console.error('El token no contiene el campo "sub"');
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
  }

  private async loadUsageSummary(): Promise<void> {
    try {
      this.plan = this.authService.getSubscriptionType();

      // Si tu endpoint History devuelve pocas, esto puede "clavarse".
      // Ideal: usar un endpoint UsageSummary en backend.
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

      // 🔹 Pedimos el límite al backend
      const rawLimit = await this.dataConversionService.getLimitByPlan(this.plan);

      // Si el back devuelve algo tipo int.MaxValue para Pro → ilimitado
      if (rawLimit >= 1_000_000) {
        this.limit = null;
        this.remaining = null;
      } else {
        this.limit = rawLimit;
        this.remaining = Math.max(this.limit - this.usedConversions, 0);
      }

    } catch (e) {
      console.error('Error al cargar resumen de uso:', e);
    }
  }
}
