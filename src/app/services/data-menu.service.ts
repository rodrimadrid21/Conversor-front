import { inject, Injectable } from '@angular/core';
import { DataAuthService } from './data-auth.service';
import { Moneda } from '../interfaces/moneda';
import { Conversion } from '../interfaces/conversion';
import { environment } from '../../environment/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DataMenuService {

  
  monedas: Moneda[] = [];
  conversiones: Conversion[] = []
  
  authService = inject(DataAuthService);
  constructor() {
    this.loadData()
  }

  async loadData() {
    await this.getMonedas();
    await this.getConversiones();
    //this.asociarConversionesConMonedas();
  }

  async getMonedas() {
    const res = await fetch(environment.API_URL + 'Moneda', {
        headers: {
            authorization: 'Bearer ' + localStorage.getItem("authToken")
        },
    });
    if (res.status !== 200) return;
    
    const resJson: Moneda[] = await res.json();
    
    // Ordenar las cocheras por `id` de menor a mayor
    const sortedCocheras = resJson.sort((a, b) => a.id - b.id);
    
    // Agregar un número secuencial comenzando desde 1
    this.monedas = sortedCocheras.map((moneda, index) => ({
        ...moneda,//
        numeroVirtual: index + 1 // Agrega el número virtual a cada cochera
    }));
}

async getConversiones() {
  const res = await fetch(environment.API_URL+'Conversion', {
    headers: {
      authorization: 'Bearer ' + localStorage.getItem("authToken")
    },
  });
  if(res.status !== 200) return;
  const resJson: Conversion[] = await res.json();
  this.conversiones  = resJson;
}

//asociarConversionesConMonedas() {
//  this.monedas = this.monedas.map(moneda => {
//    const conversion = this.conversiones.find(e => e.UsuarioId === moneda.id && !e.fechaConversion)//find busca un solo elemento
//    return {...moneda, conversion}
//  });
//}

}
