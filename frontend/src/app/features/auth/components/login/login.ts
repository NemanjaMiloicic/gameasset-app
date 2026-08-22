import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { LoginPayload } from '../../interfaces/login-payload.interface';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  errorMessage = signal('');

  loginForm = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const payload: LoginPayload = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    };

    this._authService.login(payload).subscribe({
      next: (response) => {
        localStorage.setItem('accessToken', response.accessToken);
        this._router.navigate(['/']);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Login failed');
      },
    });
  }
}
