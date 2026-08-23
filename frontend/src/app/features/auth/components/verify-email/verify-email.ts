import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _authService = inject(AuthService);

  statusMessage = signal('Verifying...');
  isError = signal(false);

  ngOnInit(): void {
  const token = this._route.snapshot.queryParamMap.get('token');

  if (!token) {
    this.statusMessage.set('No verification token provided.');
    this.isError.set(true);
    return;
  }

  this._authService.verifyEmail(token).subscribe({
    next: (response) => {
      this.statusMessage.set(response.message);
    },
    error: (err) => {
      this.statusMessage.set(err.error?.message ?? 'Verification failed');
      this.isError.set(true);
      },
    });
  }
  
}
