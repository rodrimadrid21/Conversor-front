import { Injectable } from '@angular/core';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DataHistorialService {
  private apiUrl = `${environment.API_URL}Conversion`;

  constructor() {}

  async getHistorial(userId: number): Promise<Conversion[]> {
    try {
      const response = await fetch(`${this.apiUrl}/History/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al obtener el historial:', response.statusText, errorText);
        throw new Error(`Error al obtener el historial: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener el historial:', error);
      throw error;
    }
  }

}