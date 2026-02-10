import { Injectable } from '@angular/core';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';
import { DataAuthService } from './data-auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataConversionService {

  constructor(private authService: DataAuthService) {}

  // =========================
// POST /api/Conversion
// =========================
async performConversion(conversionRequest: Conversion): Promise<
  | { ok: true; data: any }
  | { ok: false; status: number; message: string }
> {
  const token = this.authService.getToken();
  console.log('Token recuperado desde AuthService:', token);
  console.log('Body enviado a /Conversion:', conversionRequest);

  if (!token) {
    console.error('Token no disponible');
    // acá sí tiramos error porque es un bug de sesión local
    throw new Error('Token no disponible');
  }

  const response = await fetch(`${environment.API_URL}Conversion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(conversionRequest),
  });

  // ✅ Si está OK, devolvemos data normal
  if (response.ok) {
    const data = await response.json();
    return { ok: true, data };
  }

  // ✅ Si NO está OK, armamos un mensaje prolijo (json o texto)
  let msg = '';
  try {
    const json = await response.json();
    msg = json?.message ?? json?.Message ?? JSON.stringify(json);
  } catch {
    msg = await response.text();
  }

  if (response.status === 403) {
  console.warn('Límite alcanzado (esperado):', msg);
} else {
  console.error('Error en performConversion:', response.status, msg);
}

  // ✅ Para 403/401 devolvemos un "resultado controlado" (NO throw)
  if (response.status === 403 || response.status === 401) {
    return { ok: false, status: response.status, message: msg };
  }

  // ❌ Para otros errores (500, 400 raros), sí tiramos error para debug
  throw new Error(`Error en performConversion: ${response.status} - ${msg}`);
}
  // =========================
// GET /api/Suscripcion/Limit/{type}
// =========================
async getLimitByPlan(plan: 'Free' | 'Trial' | 'Pro'): Promise<number> {
  const token = this.authService.getToken();
  if (!token) {
    throw new Error('Token no disponible.');
  }

  const res = await fetch(`${environment.API_URL}Suscripcion/Limit/${plan}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error('Error al obtener límite de suscripción:', res.status, txt);
    // Si falla, devolvemos un límite “cero” para no mentir
    throw new Error('No se pudo obtener el límite de suscripción.');
  }

  const json = await res.json();
  // El back manda { type: "Free", conversionLimit: 2 } o con C mayúscula
  const limit = json.conversionLimit ?? json.ConversionLimit ?? 0;
  return limit;
}

  // =========================
  // GET /api/Conversion/History
  // =========================
  async getUltimasConversiones(): Promise<Conversion[]> {
    const token = this.authService.getToken();
    console.log('Token usado para History:', token);

    const url = `${environment.API_URL}Conversion/History`;

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
  //async addConversionToHistorial(conversion: Conversion): Promise<void> {
  //  try {
  //    const token = localStorage.getItem('jwtToken');  // Obtener el token desde el localStorage
  //    const url = `${environment.API_URL}Conversion`;
//
  //    const response = await fetch(url, {
  //      method: 'POST',
  //      headers: {
  //        'Content-Type': 'application/json',
  //        'Authorization': `Bearer ${token}`,
  //      },
  //      body: JSON.stringify(conversion)
  //    });
//
  //    if (!response.ok) {
  //      const errorText = await response.text();
  //      console.error('Error al agregar la conversión al historial:', response.statusText, errorText);
  //      throw new Error(`Error al agregar la conversión al historial: ${response.statusText} - ${errorText}`);
  //    }
  //  } catch (error) {
  //    console.error('Error al agregar la conversión al historial:', error);
  //    throw error;
  //  }
  //}
}
