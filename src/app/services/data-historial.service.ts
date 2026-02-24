import { Injectable } from '@angular/core';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';
import { DataAuthService } from './data-auth.service';

@Injectable({ providedIn: 'root' })
export class DataHistorialService {
  constructor(private authService: DataAuthService) {}

  // =========================
  // GET /api/Conversion/History
  // =========================
  async getHistorial(): Promise<
    | { ok: true; data: Conversion[] }
    | { ok: false; status: number; message: string }
  > {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('Token no disponible. Iniciá sesión nuevamente.');
    }

    const res = await fetch(`${environment.API_URL}Conversion/History`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data: Conversion[] = await res.json();
      return { ok: true, data };
    }

    let msg = 'Error al obtener el historial';
    try {
      const json = await res.json();
      msg = json?.message ?? json?.mensaje ?? json?.Message ?? JSON.stringify(json);
    } catch {
      msg = await res.text();
    }

    return { ok: false, status: res.status, message: msg };
  }
}