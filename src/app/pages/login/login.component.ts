import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { DataAuthService } from '../../services/data-auth.service';
import { Login, ResLogin } from '../../interfaces/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  authService = inject(DataAuthService); // Inyecta el servicio

  router = inject(Router);

  errorLogin = false;
  
  async login(loginForm: NgForm) {
    const loginData: Login = loginForm.value;

    const res = await this.authService.login(loginData);

    if (res && res.status === 'success') {
        this.router.navigate(['/dashboard/conversion']); // Navega a la página principal
    } else {
        this.errorLogin = true; // Muestra el mensaje de error
    }
}

  //async login(loginForm: NgForm) {
  //  const { UserName, Password } = loginForm.value; // Cambia username y password por UserName y Password
  //  const loginData: Login = { UserName, Password }; // Asegúrate de que coincida con la interfaz Login
  //  
  //  try {
  //      // Llama al servicio de autenticación y espera la respuesta
  //      const res: ResLogin | null = await this.authService.login(loginData);
//
  //      if (res === null) {
  //          this.errorLogin = true; // Si la respuesta es null, muestra el error
  //          return;
  //      }
//
  //      // Verifica si el login fue exitoso usando el `status`
  //      if (res.status === "success") {
  //          this.router.navigate(['/menu']); // Navega al menú si fue exitoso
  //      } else {
  //          this.errorLogin = true; // Muestra error si el login no fue exitoso
  //      }
  //  } catch (error) {
  //      // Manejo de errores en caso de que ocurra algún problema en la llamada
  //      this.errorLogin = true;
  //      console.error("Error en el login:", error);
  //  }
}
