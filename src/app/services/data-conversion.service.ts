import { Injectable } from '@angular/core';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';
import { DataAuthService } from './data-auth.service';

@Injectable({ providedIn: 'root' })
export class DataConversionService {
  constructor(private authService: DataAuthService) {}

  // POST /api/Conversion
  async executeConversion(
    conversionRequest: Conversion
  ): Promise<
    { ok: true; data: any } | { ok: false; status: number; message: string }
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

    if (res.ok) {
      const data: Conversion = await res.json();
      return { ok: true, data };
    }

    let msg = 'Error en la conversión';
    try {
      const json = await res.json();
      msg = json?.message ?? msg;
    } catch {
      msg = (await res.text()) || msg;
    }

    return { ok: false, status: res.status, message: msg };
  }
}
