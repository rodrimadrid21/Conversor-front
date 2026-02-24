import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment.development';
import { DataAuthService } from './data-auth.service';
import { Moneda } from '../interfaces/moneda';

type MonedaDto = {
  currencyId: number;
  code: string;
  legend: string;
  symbol: string;
  convertibilityIndex: number;
};

@Injectable({ providedIn: 'root' })
export class DataMonedaService {
  constructor(private authService: DataAuthService) {}

  // =========================
  // GET /api/Moneda/All
  // =========================
  async getMonedas(): Promise<
    | { ok: true; data: Moneda[] }
    | { ok: false; status: number; message: string }
  > {
    const token = this.authService.getToken();
    if (!token) throw new Error('Token no disponible. Iniciá sesión nuevamente.');

    const res = await fetch(`${environment.API_URL}Moneda/All`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const dto: MonedaDto[] = await res.json();

      // 🔥 DEBUG útil (1 sola vez, después lo podés sacar)
      console.table(dto);

      const data: Moneda[] = dto.map(m => ({
        id: m.currencyId,
        codigo: m.code,
        leyenda: m.legend,
        simbolo: m.symbol,
        eliminada: false,
        indiceConvertibilidad: m.convertibilityIndex,
      }));

      return { ok: true, data };
    }

    let msg = 'Error al obtener monedas';
    try {
      const json = await res.json();
      msg = json?.message ?? json?.mensaje ?? json?.Message ?? JSON.stringify(json);
    } catch {
      msg = await res.text();
    }

    return { ok: false, status: res.status, message: msg };
  }
}