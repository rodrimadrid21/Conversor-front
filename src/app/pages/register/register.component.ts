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
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  errorRegister = false;

    private authService = inject(DataAuthService);
    private router = inject(Router);

  async register(registerForm: NgForm): Promise<void> {
    this.errorRegister = false;

    const { username, nombre, apellido, password } = registerForm.value; // son los name del html

    const registerData: Register = {
      UserName: username,
      FirstName: nombre,
      LastName: apellido,
      Password: password,
    };

    const success = await this.authService.register(registerData);

    if (success) {
      await this.router.navigate(['/login']);
      Swal.fire('Registro exitoso', '', 'success');
      return;
    }

    this.errorRegister = true;
  }
}