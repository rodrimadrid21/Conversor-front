import { Injectable } from '@angular/core';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';  // Asegúrate de importar el environment

@Injectable({
  providedIn: 'root'
})
export class DataConversionService {

  constructor() {}

  // Realizar la conversión de divisas
  async performConversion(conversionRequest: Conversion): Promise<any> {
    const token = localStorage.getItem('jwtToken');  // Obtener el token desde el localStorage
    console.log('Token recuperado:', token);
    // Usar API_URL desde environment
    const url = `${environment.API_URL}Conversion`;

    if (token) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(conversionRequest)
      });
      console.log('Enviando token:', token);
    } else {
      console.error('Token no disponible');
    }
  }

  // Obtener últimas conversiones por userId
  async getUltimasConversiones(userId: number): Promise<Conversion[]> {
    const token = localStorage.getItem('jwtToken');  // Obtener el token desde el localStorage
    console.log('Token:', token);

    const url = `${environment.API_URL}Conversion/History/${userId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error al obtener las últimas conversiones:', response.statusText, errorText);
      throw new Error(`Error al obtener las últimas conversiones: ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  // Agregar una conversión al historial
  async addConversionToHistorial(conversion: Conversion): Promise<void> {
    try {
      const token = localStorage.getItem('jwtToken');  // Obtener el token desde el localStorage
      const url = `${environment.API_URL}Conversion`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(conversion)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error al agregar la conversión al historial:', response.statusText, errorText);
        throw new Error(`Error al agregar la conversión al historial: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error al agregar la conversión al historial:', error);
      throw error;
    }
  }
}
