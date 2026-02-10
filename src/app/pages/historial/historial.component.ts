// src/app/pages/historial/historial.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataConversionService } from '../../services/data-conversion.service';
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
  private dataConversionService = inject(DataConversionService);

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  

  async obtenerHistorial(): Promise<void> {
    try {

    // Traemos el historial
    this.historial = await this.dataConversionService.getUltimasConversiones();

    // 🔥 ORDENAR POR FECHA (más reciente → más viejo)
    this.historial = this.historial.sort((a, b) => {
  const timeA = a.date ? new Date(a.date).getTime() : 0;
  const timeB = b.date ? new Date(b.date).getTime() : 0;
  return timeB - timeA;   // más reciente primero
});


    console.log('Historial obtenido:', this.historial);
    console.table(this.historial);

  } catch (error) {
    console.error('Error al obtener el historial:', error);
  }
  }
}
