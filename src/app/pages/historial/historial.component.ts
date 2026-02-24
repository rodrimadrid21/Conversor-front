// src/app/pages/historial/historial.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataHistorialService } from '../../services/data-historial.service';
import { Conversion } from '../../interfaces/conversion';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  historial: Conversion[] = [];
  errorMessage = '';

  private historialService = inject(DataHistorialService);

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  async obtenerHistorial(): Promise<void> {
    this.errorMessage = '';

    try {
      const res = await this.historialService.getHistorial();

      if (!res.ok) {
        this.errorMessage = res.message || 'No se pudo cargar el historial.';
        this.historial = [];
        return;
      }

      this.historial = res.data.sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        return timeB - timeA;
      }).slice(0, 15);

      console.table(this.historial);
    } catch (error: any) {
      console.error('Error al obtener el historial:', error);
      this.errorMessage = error?.message || 'Error inesperado al obtener el historial.';
      this.historial = [];
    }
  }
}