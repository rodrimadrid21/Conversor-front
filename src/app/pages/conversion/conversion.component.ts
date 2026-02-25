import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DataConversionService } from '../../services/data-conversion.service';
import { DataAuthService } from '../../services/data-auth.service';
import { DataMonedaService } from '../../services/data-moneda.service';

import { Conversion } from '../../interfaces/conversion';
import { Moneda } from '../../interfaces/moneda';

type Plan = 'Free' | 'Trial' | 'Pro';

@Component({
  selector: 'app-conversion',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss'],
})
export class ConversionComponent implements OnInit {
  monedas: Moneda[] = [];

  conversionRequest: Conversion = this.createEmptyRequest(); // para no repetir código, esto se resetea cada vez que se hace una conversión

  conversionResult: any = null;
  errorMessage = '';
  plan: Plan = 'Free';

  private conversionService = inject(DataConversionService);
  private monedaService = inject(DataMonedaService);
  private authService = inject(DataAuthService);
  
  async ngOnInit(): Promise<void> {
    this.plan = this.authService.getSubscriptionType();
    await this.cargarMonedas();
  }

  // =========================
  // Cargar Monedas
  // =========================
  private async cargarMonedas(): Promise<void> {
    this.errorMessage = '';

    try {
      const res = await this.monedaService.getMonedas();

      if (!res.ok) {
        this.errorMessage =
          res.message || 'No se pudo cargar el listado de monedas.';
        this.monedas = [];
        return;
      }

      this.monedas = res.data; // se cargan las monedas
    } catch (error: any) {
      console.error('Error al cargar monedas:', error);
      this.errorMessage =
        error?.message || 'Error inesperado al cargar monedas.';
      this.monedas = [];
    }
  }

  // =========================
  // Submit Convertir
  // =========================
  async performConversion(event: Event): Promise<void> {
    event.preventDefault(); // para que no se recargue la página

    this.errorMessage = '';
    this.conversionResult = null;

    // Validaciones mínimas (UX)
    if (
      !this.conversionRequest.fromCurrency ||
      !this.conversionRequest.toCurrency
    ) // si no seleccionó alguna moneda
    {
      this.errorMessage = 'Seleccioná moneda origen y destino.';
      return;
    }
    if (
      this.conversionRequest.fromCurrency === this.conversionRequest.toCurrency
    ) {
      this.errorMessage = 'Elegí dos monedas distintas.';
      return;
    }
    if (this.conversionRequest.amount <= 0) {
      this.errorMessage = 'La cantidad debe ser mayor a 0.';
      return;
    }

    // Fecha
    this.conversionRequest.date = new Date().toISOString(); //obtiene la fecha y la pasa a string

    // Busca en el array monedas el objeto cuya propiedad codigo sea igual a fromCurrency
    const from = this.monedas.find(
      (m) => m.codigo === this.conversionRequest.fromCurrency,
    );
    const to = this.monedas.find(
      (m) => m.codigo === this.conversionRequest.toCurrency,
    );

    // El back calcula el result - no puede ser undefined
    this.conversionRequest.result = 0;
    this.conversionRequest.conversionId = 0;

    // llamamos al service y le pasamos el obj con los datos de la conversión
    const result = await this.conversionService.executeConversion(
      this.conversionRequest,
    );
    if (result.ok) {
      this.conversionResult = result.data.conversion;
    } else {
      this.errorMessage = result.message;
    }
  }

  private createEmptyRequest(): Conversion {
    return {
      conversionId: 0,
      usuarioId: 0,
      fromCurrency: '',
      toCurrency: '',
      amount: 0,
      fromCurrencySymbol: undefined,
      toCurrencySymbol: undefined,
      result: 0,
      date: undefined,
    };
  }
}
