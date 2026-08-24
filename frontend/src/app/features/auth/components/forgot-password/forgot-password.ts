import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authService = inject(AuthService);

  statusMessage = signal('');
  isError = signal(false);
  isLoading = signal(false);

  forgotPasswordForm = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.statusMessage.set('');

    this._authService
      .forgotPassword({
        email: this.forgotPasswordForm.value.email!,
      })
      .subscribe({
        next: (response) => {
          this.statusMessage.set(response.message);
          this.isError.set(false);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.statusMessage.set(
            err.error?.message ?? 'Something went wrong'
          );
          this.isError.set(true);
          this.isLoading.set(false);
        },
      });
  }
}