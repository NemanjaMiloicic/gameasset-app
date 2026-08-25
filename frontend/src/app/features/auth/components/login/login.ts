import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth.actions';
import { selectError, selectIsLoading } from '../../store/auth.selectors';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _store = inject(Store);

  errorMessage = this._store.selectSignal(selectError);
  isLoading = this._store.selectSignal(selectIsLoading);

  loginForm = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this._store.dispatch(AuthActions.login({
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!,
    }));
  }
}