import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { Login, ResLogin } from '../interfaces/login';
import { environment } from '../../environment/environment.development';
import { Register } from '../interfaces/register';
import { Conversion } from "../interfaces/conversion";

@Injectable({
  providedIn: 'root'
})
export class DataAuthService {

  usuario: Usuario | undefined;

  constructor() {
    const token = this.getToken();
    const storedPlan = localStorage.getItem('subscriptionType') as 'Free' | 'Trial' | 'Pro' | null;

    if (token) {
      this.usuario = this.usuario || { 
        UserId: 0,
        FirstName: '',
        LastName: '',
        UserName: '',
        token, 
        isAdmin: false,
        subscriptionType: storedPlan || 'Free' // 🔹 por defecto Free
 
      };
    } else {
      this.clearToken();
    }
  }

  async login(loginData: Login): Promise<ResLogin | null> {
  try {
    const res = await fetch(`${environment.API_URL}Authentication/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    if (!res.ok) {
      // Manejo centralizado del error en lugar de lanzar console.error
      const errorData = await res.json();
      throw new Error(errorData.mensaje || 'Error desconocido en login');
    }

    const resJson: ResLogin = await res.json();
    console.log('Respuesta del servidor:', resJson);  // Verifica el contenido de la respuesta

    if (resJson.status !== 'success' || !resJson.token) {
      throw new Error(resJson.mensaje || 'Autenticación fallida');
    }

    localStorage.setItem('jwtToken', resJson.token); // Guarda el token
    console.log('Token guardado:', localStorage.getItem('jwtToken'));
    // 🔹 al loguear, si no sabemos el plan aún, asumimos Free
      if (!localStorage.getItem('subscriptionType')) {
        localStorage.setItem('subscriptionType', 'Free');
      }
    return resJson;
  } catch (error) {
    console.error("Error en el servicio de login:", error);
    return null;
  }
}

  async register(registerData: Register): Promise<boolean> {
    try {
      const res = await fetch(`${environment.API_URL}Usuario/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error en el registro:", errorData.mensaje);
        return false;
      }

      return true; // Registro exitoso
    } catch (error) {
      console.error("Error al conectarse con la API:", error);
      return false;
    }
  }

  setUsuario(usuario: Usuario) {
    this.usuario = usuario;
  }

  getUsuario(): Usuario | undefined {
    return this.usuario;
  }

  getToken(){
    return localStorage.getItem("jwtToken");
  }

  clearToken() {
    localStorage.removeItem("jwtToken");
    this.usuario = undefined;
  }

  // 🔹 NUEVO: activar plan Free/Trial/Pro
  // =====================================
  // plan puede ser 'Free' | 'Trial' | 'Pro'
  async activarPlan(plan: 'Free' | 'Trial' | 'Pro'): Promise<string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Token no disponible. Iniciá sesión nuevamente.');
    }

    // Mapeo a tu enum del backend:
    // 0 = Free, 1 = Trial, 2 = Pro
    const typeValue =
      plan === 'Free'  ? 0 :
      plan === 'Trial' ? 1 :
      2; // Pro

    const body = {
      id: 0,
      type: typeValue,
      conversionLimit: 0,
      monthlyReset: true
    };

    const res = await fetch(`${environment.API_URL}Usuario/activar-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      let serverMessage = '';
      try {
        const json = await res.json();
        serverMessage = json?.message || JSON.stringify(json);
      } catch {
        serverMessage = await res.text();
      }

      const error: any = new Error(serverMessage || 'Error al actualizar la suscripción.');
      error.status = res.status;
      throw error;
    }

    const data = await res.json();
    // El back devuelve { message: "Suscripción actualizada a Trial" }
    const msg = data?.message || 'Suscripción actualizada correctamente.';

    // 🔹 actualizamos el usuario en memoria y en localStorage
    if (!this.usuario) {
      this.usuario = {
        UserId: 0,
        FirstName: '',
        LastName: '',
        UserName: '',
        token: token,
        isAdmin: false,
        subscriptionType: plan
      };
    } else {
      this.usuario.subscriptionType = plan;
    }

    localStorage.setItem('subscriptionType', plan);

    // 🔥 MUY IMPORTANTE: avisar que el plan cambió
    this.notifySubscriptionChanged();

    return msg;
  }

  // 🔹 Getter para que el Dashboard pueda mostrar el plan actual
  getSubscriptionType(): 'Free' | 'Trial' | 'Pro' {
    return (
      this.usuario?.subscriptionType ||
      (localStorage.getItem('subscriptionType') as 'Free' | 'Trial' | 'Pro' | null) ||
      'Free'
    );
  }

  // 🔥 LISTENER para avisar cambios de plan
private subscriptionListeners: Array<() => void> = [];

addSubscriptionChangeListener(fn: () => void) {
  this.subscriptionListeners.push(fn);
}

private notifySubscriptionChanged() {
  for (const fn of this.subscriptionListeners) {
    try { fn(); }
    catch (e) { console.error('Error al ejecutar listener:', e); }
  }
}
}