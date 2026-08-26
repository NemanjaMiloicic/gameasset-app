import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { selectUser } from '../../../auth/store/auth.selectors';
import { AuthorService } from '../../author.service';

@Component({
  selector: 'app-author-dashboard',
  imports: [RouterLink],
  templateUrl: './author-dashboard.html',
  styleUrl: './author-dashboard.css',
})
export class AuthorDashboard {
  private readonly _authorService = inject(AuthorService);

  user = inject(Store).selectSignal(selectUser);
  isRedirecting = false;

  onBecomeAuthor(): void {
    this.isRedirecting = true;
    this._authorService.connectStripe().subscribe({
      next: (response) => {
        window.location.href = response.onboardingUrl;
      },
      error: () => {
        this.isRedirecting = false;
      },
    });
  }
}