import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataAuthService } from '../../services/data-auth.service';
import { Login } from '../../interfaces/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(DataAuthService);
  private router = inject(Router);

  errorLogin = false;

  async login(form: NgForm) {
    this.errorLogin = false; 
    const loginData: Login = form.value;

    const res = await this.authService.login(loginData);

    if (res?.status === 'success') // si existe mira su estado
      {
      this.router.navigate(['/dashboard/conversion']);
      return;
    }

    this.errorLogin = true;
  }
}