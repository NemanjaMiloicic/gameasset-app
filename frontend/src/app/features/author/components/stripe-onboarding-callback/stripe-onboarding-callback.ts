import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthorService } from '../../author.service';
import { selectUser, selectToken } from '../../../auth/store/auth.selectors';
import { sessionRestored } from '../../../auth/store/auth.actions';

@Component({
  selector: 'app-stripe-onboarding-callback',
  imports: [],
  templateUrl: './stripe-onboarding-callback.html',
  styleUrl: './stripe-onboarding-callback.css',
})
export class StripeOnboardingCallback implements OnInit {
  private readonly _authorService = inject(AuthorService);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);

  errorMessage = signal('');

  ngOnInit(): void {
    this._authorService.checkOnboardingComplete().subscribe({
      next: ({ onboardingComplete }) => {
        if (onboardingComplete) {
          const currentUser = this._store.selectSignal(selectUser)();
          const currentToken = this._store.selectSignal(selectToken)();

          if (currentUser && currentToken) {
            this._store.dispatch(sessionRestored({
              user: { ...currentUser, stripeOnboardingComplete: true, userRole: 'author' },
              token: currentToken,
            }));
          }
        }
        this._router.navigate(['/author/dashboard']);
      },
      error: () => {
        this.errorMessage.set('Could not confirm onboarding status.');
      },
    });
  }
}