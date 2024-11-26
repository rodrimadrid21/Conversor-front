import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { DataMenuService } from '../../services/data-menu.service';
import { DataAuthService } from '../../services/data-auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  // Inyecta el servicio
  AuthService = inject(DataAuthService)
  router = inject(Router);

  isAdmin = true
  
  dataMenuService = inject(DataMenuService)

  async preguntarAgregarMoneda() {
    const { value: cantidad } = await Swal.fire({
      title: "Agregar ARS",
      input: "number",
      inputLabel: "Ingresa la cantidad que desea agregar",
      showCancelButton: true,
      preConfirm: (cantidad) => {
        const numero = parseFloat(cantidad);
        if (isNaN(numero) || numero <= 0) {
          Swal.showValidationMessage("Por favor, ingresa una cantidad válida mayor a 0.");
          return null;
        }
        return numero; // Retorna el número si es válido
      },
    });
  
    if (cantidad !== undefined) { // Solo si no se cancela el SweetAlert
      Swal.fire(`Has agregado: ${cantidad} ARS`);
      // Aquí puedes realizar acciones adicionales con el valor ingresado
    }
  }
  
  
  //  Swal.fire({
  //    title: "¿Que moneda queres agregar?",
  //    showCancelButton: true,
  //    confirmButtonText: "Agregar",
  //    denyButtonText: `Cancelar`,
  //    input: "text",
  //  }).then(async (result) => {
  //    /* Read more about isConfirmed, isDenied below */
  //    //if (result.isConfirmed) {
  //    //  this.dataMenuService.agregarCochera(result.value)
  //    //} else if (result.isDenied) {
  //    //}
  //  });
  //}
}
