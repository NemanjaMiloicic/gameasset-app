import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { RegisterPayload } from '../../interfaces/register-payload.interface';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  errorMessage = signal('');
  isLoading = signal(false);

  registerForm = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const payload: RegisterPayload = {
      email: this.registerForm.value.email!,
      username: this.registerForm.value.username!,
      password: this.registerForm.value.password!,
    };

    this.isLoading.set(true);
    this.errorMessage.set('');

    this._authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this._router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed');
      },
    });
  }
}