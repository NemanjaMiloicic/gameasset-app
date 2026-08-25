import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _destroy$ = new Subject<void>();

  private _token = '';
  private _email = '';

  isCheckingToken = signal(true);
  isTokenValid = signal(false);
  errorMessage = signal('');

  resetForm = inject(FormBuilder).group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this._token = this._route.snapshot.queryParamMap.get('token') ?? '';
    this._email = this._route.snapshot.queryParamMap.get('email') ?? '';

    if (!this._token || !this._email) {
      this.isCheckingToken.set(false);
      this.isTokenValid.set(false);
      this.errorMessage.set('Invalid reset link.');
      return;
    }

    this._authService
      .validatePasswordToken(this._token, this._email)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.isCheckingToken.set(false);
          this.isTokenValid.set(true);
        },
        error: (err) => {
          this.isCheckingToken.set(false);
          this.isTokenValid.set(false);
          this.errorMessage.set(err.error?.message ?? 'Invalid or expired reset link.');
        },
      });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    const password = this.resetForm.value.password!;
    const confirmPassword = this.resetForm.value.confirmPassword!;

    if (password !== confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this._authService
      .resetPassword({ token: this._token, email: this._email, password })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message ?? 'Failed to reset password.');
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}