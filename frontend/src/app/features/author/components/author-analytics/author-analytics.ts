import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { interval, Subject, startWith, takeUntil } from 'rxjs';
import { AuthorService } from '../../author.service';
import { AuthorAnalytics } from '../../interfaces/author-analytics.interface';
import { AssetSalesBreakdown } from '../../interfaces/asset-sales-breakdown.interface';

@Component({
  selector: 'app-author-analytics',
  imports: [],
  templateUrl: './author-analytics.html',
  styleUrl: './author-analytics.css',
})
export class AuthorAnalyticsComponent implements OnInit, OnDestroy {
  private readonly _authorService = inject(AuthorService);
  private readonly _destroy$ = new Subject<void>();

  analytics = signal<AuthorAnalytics | null>(null);
  salesBreakdown = signal<AssetSalesBreakdown[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    interval(15000)
      .pipe(
        startWith(0),
        takeUntil(this._destroy$)
      )
      .subscribe(() => this._loadData());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private _loadData(): void {
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

    this._authorService.getSalesBreakdown().subscribe({
      next: (data) => this.salesBreakdown.set(data),
    });
  }
}