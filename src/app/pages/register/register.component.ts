import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataAuthService } from '../../services/data-auth.service';
import { Register } from '../../interfaces/register';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  errorRegister = false;
  authService = inject(DataAuthService)
  router = inject(Router)

  async register(registerForm: NgForm) {
    const { username, nombre, apellido, password } = registerForm.value;
    const registerData: Register = { UserName: username, FirstName: nombre, LastName: apellido, Password: password };

    try {
        const success = await this.authService.register(registerData);

        if (success) {
            this.router.navigate(['/login']).then(() => {
                Swal.fire("Registro exitoso", "", "success");
            });
        } else {
            this.errorRegister = true;
        }
    } catch (error) {
        this.errorRegister = true;
        console.error("Error en el registro:", error);
    }
}
}
