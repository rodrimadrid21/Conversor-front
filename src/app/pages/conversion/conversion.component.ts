import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataConversionService } from '../../services/data-conversion.service';
import { Conversion } from '../../interfaces/conversion';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-conversion',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './conversion.component.html',
  styleUrls: ['./conversion.component.scss']
})
export class ConversionComponent implements OnInit {
  conversionRequest: Conversion = {
    UsuarioId: 0, // Este valor se configura automáticamente con el token JWT
    FromCurrency: '',
    ToCurrency: '',
    Amount: 0,
    fechaConversion: '', // Este campo puede ser calculado en el backend
  };
  conversionResult: any = null;
  errorMessage: string = '';

  // Inyección de dependencias usando inject
  private dataConversionService = inject(DataConversionService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getUserId();
  }

  async performConversion(event: Event): Promise<void> {
    event.preventDefault(); // Prevenir el recargo de la página
    try {
      await this.getUserId(); // Asegúrate de que getUserId se ejecute correctamente
      this.conversionRequest.fechaConversion = new Date().toISOString();

      // Llama al método del servicio para realizar la conversión
      const result = await this.dataConversionService.performConversion(this.conversionRequest);
      this.conversionResult = result.conversion;
      console.log('Resultado de la conversión:', this.conversionResult); // Verificar en consola

      // Agregar la conversión al historial
      await this.dataConversionService.addConversionToHistorial(this.conversionResult);
      console.log('Conversión agregada al historial');

      // Marcar los cambios para que Angular los detecte
      this.cdr.detectChanges();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error inesperado al realizar la conversión.';
    }
  }

  // Obtener el ID del usuario desde el localStorage (suponiendo que esté guardado allí)
  private async getUserId(): Promise<void> {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const decodedToken = JSON.parse(decodedPayload);

        if (decodedToken.sub) {
          this.conversionRequest.UsuarioId = decodedToken.sub;
        } else {
          console.error('El token no contiene el campo "sub"');
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    } else {
      console.error('No se encontró el token en localStorage');
    }
  }
}
