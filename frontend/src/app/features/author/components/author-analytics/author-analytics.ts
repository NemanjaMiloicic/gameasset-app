import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthorService } from '../../author.service';
import { AuthorAnalytics } from '../../interfaces/author-analytics.interface';

@Component({
  selector: 'app-author-analytics',
  imports: [],
  templateUrl: './author-analytics.html',
  styleUrl: './author-analytics.css',
})
export class AuthorAnalyticsComponent implements OnInit {
  private readonly _authorService = inject(AuthorService);

  analytics = signal<AuthorAnalytics | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    this._authorService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message ?? 'Failed to load analytics');
        this.isLoading.set(false);
      },
    });
  }
}