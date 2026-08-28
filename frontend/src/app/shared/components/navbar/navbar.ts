import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, RouterLink } from '@angular/router';
import { selectIsAuthenticated, selectUser } from '../../../features/auth/store/auth.selectors';
import * as AuthActions from '../../../features/auth/store/auth.actions';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);

  isAuthenticated = this._store.selectSignal(selectIsAuthenticated);
  user = this._store.selectSignal(selectUser);

  onLogout(): void {
    this._store.dispatch(AuthActions.logout());
  }

  onAuthorClick(): void {
    if (this.isAuthenticated()) {
      this._router.navigate(['/author/dashboard']);
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
}