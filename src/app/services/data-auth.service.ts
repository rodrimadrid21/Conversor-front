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

    if (token) {
      this.usuario = this.usuario || { 
        UserId: 0,
        FirstName: '',
        LastName: '',
        UserName: '',
        token, 
        isAdmin: false 
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

}