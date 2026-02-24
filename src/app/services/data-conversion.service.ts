import { Injectable } from '@angular/core';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';
import { DataAuthService } from './data-auth.service';

@Injectable({ providedIn: 'root' })
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

    if (!token) {
      throw new Error('Token no disponible. Iniciá sesión nuevamente.');
    }

    const res = await fetch(`${environment.API_URL}Conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(conversionRequest),
    });

    // ✅ OK
    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }

    // ❌ NOT OK -> mensaje prolijo (json o texto)
    let msg = 'Error en la conversión';
    try {
      const json = await res.json();
      msg = json?.message ?? json?.mensaje ?? json?.Message ?? JSON.stringify(json);
    } catch {
      msg = await res.text();
    }

    // ✅ Errores esperables
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      return { ok: false, status: res.status, message: msg };
    }

    // ❌ Errores inesperables (500, etc.)
    throw new Error(`Error HTTP: ${res.status} - ${msg}`);
  }
}