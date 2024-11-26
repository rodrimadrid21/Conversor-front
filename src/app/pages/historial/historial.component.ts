import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataConversionService } from '../../services/data-conversion.service';
import { Conversion } from '../../interfaces/conversion';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  historial: Conversion[] = [];
  dataConversionService = inject(DataConversionService);

  ngOnInit(): void {
    this.obtenerHistorial();
  }

  async obtenerHistorial(): Promise<void> {
    const userId = this.getUserId();
    try {
      this.historial = await this.dataConversionService.getUltimasConversiones(userId);
      console.log('Historial obtenido:', this.historial); // Verificar en consola
    } catch (error) {
      console.error('Error al obtener el historial:', error);
    }
  }

  // Obtener el ID del usuario desde el localStorage (suponiendo que esté guardado allí)
  private getUserId(): number {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica el token JWT
        if (decodedToken.sub) {
          return decodedToken.sub; // Aquí usamos el "sub" como UsuarioId
        } else {
          console.error('El token no contiene el campo "sub"');
          return 0;
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return 0;
      }
    } else {
      console.error('No se encontró el token en localStorage');
      return 0;
    }
  }
}
