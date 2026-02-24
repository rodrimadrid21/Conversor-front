import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DataConversionService } from '../../services/data-conversion.service';
import { DataAuthService } from '../../services/data-auth.service';
import { DataMonedaService } from '../../services/data-moneda.service';

import { Conversion } from '../../interfaces/conversion';
import { Moneda } from '../../interfaces/moneda';

@Component({
  selector: 'app-conversion',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss'],
})
export class ConversionComponent implements OnInit {
  // Dropdown data
  monedas: Moneda[] = [];

  // Form model
  conversionRequest: Conversion = {
    conversionId: 0,
    usuarioId: 0, // si el back lo toma del JWT, puede quedar 0 y listo
    fromCurrency: '',
    toCurrency: '',
    amount: 0,
    fromCurrencySymbol: undefined,
    toCurrencySymbol: undefined,
    result: 0,
    date: undefined,
  };

  conversionResult: any = null;
  errorMessage = '';

  plan: 'Free' | 'Trial' | 'Pro' = 'Free';

  private conversionService = inject(DataConversionService);
  private monedaService = inject(DataMonedaService);
  private authService = inject(DataAuthService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    this.plan = this.authService.getSubscriptionType();
    await this.cargarMonedas();
    this.cdr.detectChanges();
  }

  // =========================
  // Cargar Monedas
  // =========================
  private async cargarMonedas(): Promise<void> {
    this.errorMessage = '';

    try {
      const res = await this.monedaService.getMonedas();

      if (!res.ok) {
        this.errorMessage = res.message || 'No se pudo cargar el listado de monedas.';
        this.monedas = [];
        return;
      }

      this.monedas = res.data;

      // Defaults: si no hay selección, ponemos la primera y segunda moneda
      if (!this.conversionRequest.fromCurrency && this.monedas.length > 0) {
        this.conversionRequest.fromCurrency = this.monedas[0].codigo;
      }
      if (!this.conversionRequest.toCurrency && this.monedas.length > 1) {
        this.conversionRequest.toCurrency = this.monedas[1].codigo;
      }

      // Debug útil (podés borrarlo después)
      console.table(this.monedas);
    } catch (e: any) {
      console.error('Error al cargar monedas:', e);
      this.errorMessage = e?.message || 'Error inesperado al cargar monedas.';
      this.monedas = [];
    }
  }

  // =========================
  // Submit Convertir
  // =========================
  async performConversion(event: Event): Promise<void> {
    event.preventDefault();

    this.errorMessage = '';
    this.conversionResult = null;

    // Validaciones mínimas (UX)
    if (!this.conversionRequest.fromCurrency || !this.conversionRequest.toCurrency) {
      this.errorMessage = 'Seleccioná moneda origen y destino.';
      return;
    }
    if (this.conversionRequest.fromCurrency === this.conversionRequest.toCurrency) {
      this.errorMessage = 'Elegí dos monedas distintas.';
      return;
    }
    if (this.conversionRequest.amount <= 0) {
      this.errorMessage = 'La cantidad debe ser mayor a 0.';
      return;
    }

    // Fecha
    this.conversionRequest.date = new Date().toISOString();

    // Símbolos reales (mejor que repetir el código)
    const from = this.monedas.find(m => m.codigo === this.conversionRequest.fromCurrency);
    const to = this.monedas.find(m => m.codigo === this.conversionRequest.toCurrency);

    this.conversionRequest.fromCurrencySymbol = from?.simbolo ?? this.conversionRequest.fromCurrency;
    this.conversionRequest.toCurrencySymbol = to?.simbolo ?? this.conversionRequest.toCurrency;

    // El back calcula el result
    this.conversionRequest.result = 0;
    this.conversionRequest.conversionId = 0;

    try {
      const result = await this.conversionService.performConversion(this.conversionRequest);

      if (result.ok) {
        const response = result.data;
        this.conversionResult = response.conversion ?? response.Conversion ?? response;
      } else {
        if (result.status === 400) {
          this.errorMessage = result.message || 'Revisá los datos enviados.';
        } else if (result.status === 403) {
          this.errorMessage = result.message || 'Alcanzaste el límite de conversiones de tu plan.';
        } else if (result.status === 401) {
          this.errorMessage = 'Sesión inválida o expirada. Iniciá sesión de nuevo.';
        } else {
          this.errorMessage = result.message || 'Error inesperado al realizar la conversión.';
        }
      }

      this.cdr.detectChanges();
    } catch (error: any) {
      console.error('Error en performConversion (componente):', error);
      this.errorMessage = error?.message || 'Error inesperado.';
      this.cdr.detectChanges();
    }
  }
}