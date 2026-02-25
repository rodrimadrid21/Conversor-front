import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { Login, ResLogin } from '../interfaces/login';
import { Register } from '../interfaces/register';
import { environment } from '../../environment/environment.development';

type Plan = 'Free' | 'Trial' | 'Pro';

@Injectable({ providedIn: 'root' })
export class DataAuthService {
  private usuario?: Usuario;

  // array de funciones
  private listeners: (() => void)[] = [];

  // agrega a la lista (callbacks = funciones que se pasan como argumento a otra fun)
  onChange(callback: () => void) {
    this.listeners.push(callback);
  }

  // dispara el cambio
  private triggerChange() {
    for (const listener of this.listeners) {
      listener(); // variable que contiene una funccion === listener = () => { ... }
    }
  }
  // constructor: ¿Ya había una sesión guardada en el navegador? *preg*
  constructor() {
    // “Hidratar” directo desde el constructor
    const token = localStorage.getItem('jwtToken');

    if (!token) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('subscriptionType');
      this.usuario = undefined;
      return;
    }

    const plan =
      (localStorage.getItem('subscriptionType') as Plan | null) || 'Free'; // si no hay plan guardado, pongo Free

    // *res* Reconstruye el objeto usuario en memoria usando: token + plan guardados
    this.usuario = {
      token,
      isAdmin: false,
      subscriptionType: plan,
    };
    // ejecuta listeners y carga(actualiza) el storage
    this.triggerChange();
  }

  // ---------------------------
  // Auth
  // ---------------------------
  async login(loginData: Login): Promise<ResLogin | null> {
    // esta promesa va a devolver Reslogin o null
    try {
      const res = await fetch(`${environment.API_URL}Authentication/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) //res.ok = 200 a 299
      {
        let msg = 'Error desconocido en login';
        try {
          const json = await res.json(); //esperamos
          msg = json.message || json.mensaje || msg; //capturamos
        } catch {}
        throw new Error(msg);
      }
      const data: ResLogin = await res.json();

      if (data.status !== 'success' || !data.token) {
        throw new Error(data.mensaje || 'Autenticación fallida');
      }

      // guardo token
      localStorage.setItem('jwtToken', data.token);

      // crea usuario en memoria leyendo storage
      const plan =
        (localStorage.getItem('subscriptionType') as Plan | null) || 'Free';
      this.usuario = {
        token: data.token,
        isAdmin: false,
        subscriptionType: plan,
      };
      this.triggerChange();
      return data;
    } catch (e) {
      console.error('Error en login:', e);
      return null;
    }
  }

  async register(registerData: Register): Promise<boolean> {
    try {
      const res = await fetch(`${environment.API_URL}Usuario/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(
          'Error en registro:',
          errorData.message || 'Error en registro',
        );
        return false;
      }
      return true;
    } catch (e) {
      console.error('Error al conectarse con la API:', e);
      return false;
    }
  }

  // ---------------------------
  // sesión
  // ---------------------------
  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }
  // logout- limpia sesion
  clearToken() {
    localStorage.removeItem('jwtToken');
    this.usuario = undefined;
    this.triggerChange();
  }

  // ---------------------------
  // Plan
  // ---------------------------
  async activarPlan(plan: Plan): Promise<string> {
    const token = this.getToken();
    if (!token)
      throw new Error('Token no disponible. Iniciá sesión nuevamente.');

    const typeValue = plan === 'Free' ? 0 : plan === 'Trial' ? 1 : 2; //sino es ninguno es 2

    const res = await fetch(`${environment.API_URL}Usuario/activar-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: typeValue,
      }),
    });

    if (!res.ok) {
      let msg = 'Error al actualizar la suscripción.';

      try {
        const json = await res.json();
        msg = json?.message || json?.mensaje || msg;
      } catch {}

      const error: any = new Error(msg);
      error.status = res.status;
      throw error;
    }

    const data = await res.json();
    const msg = data?.message || 'Suscripción actualizada correctamente.';

    // guardo plan en storage
    localStorage.setItem('subscriptionType', plan);
    // actualizo memoria
    if (!this.usuario) {
      throw new Error('Estado inválido: usuario no cargado en memoria.');
    }

    this.usuario.subscriptionType = plan;
    this.usuario.token = token;

    this.triggerChange();
    return msg;
  }

  async getLimitByPlan(plan: 'Free' | 'Trial' | 'Pro'): Promise<number | null> {
    const token = this.getToken();
    if (!token) return null;

    const res = await fetch(
      `${environment.API_URL}Suscripcion/ByType/${plan}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!res.ok) return null;

    const json = await res.json();
    return json.conversionLimit ?? null; // Devuelve conversionLimit si existe, si no null
  }

  getSubscriptionType(): Plan {
    return this.usuario?.subscriptionType ?? 'Free';
  }
}
