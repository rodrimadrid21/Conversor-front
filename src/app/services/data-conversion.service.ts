import { Injectable } from '@angular/core';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';  // Asegúrate de importar el environment
import { DataAuthService } from './data-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataConversionService {

  constructor(private authService: DataAuthService) {}

async performConversion(conversionRequest: Conversion): Promise<any> {
  const token = this.authService.getToken();
  console.log('Token recuperado desde AuthService:', token);

  if (token) {
    const response = await fetch(`${environment.API_URL}Conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(conversionRequest),
    });
    console.log('Enviando token:', token);
    return response.json();
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
