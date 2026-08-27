import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthorService } from '../../author.service';
import { selectUser } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _authorService = inject(AuthorService);
  private readonly _store = inject(Store);
  private readonly _router = inject(Router);

  errorMessage = signal('');
  isSubmitting = signal(false);
  currentAvatarUrl = signal<string | null>(null);

  avatarFile: File | null = null;

  profileForm = this._formBuilder.group({
    bio: ['', [Validators.maxLength(500)]],
  });

  ngOnInit(): void {
    const currentUser = this._store.selectSignal(selectUser)();
    if (!currentUser) return;

    this._authorService.getPublicProfile(currentUser.id).subscribe({
      next: (profile) => {
        this.profileForm.patchValue({ bio: profile.bio ?? '' });
        this.currentAvatarUrl.set(profile.avatarUrl ?? null);
      },
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.avatarFile = input.files?.[0] ?? null;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isSubmitting.set(true);

    const requests: Promise<any>[] = [
      new Promise((resolve, reject) => {
        this._authorService.updateProfile({
          bio: this.profileForm.value.bio ?? '',
          }).subscribe({
                next: resolve,
                error: reject,
          });
      }),
    ];

    if (this.avatarFile) {
        requests.push(
            new Promise((resolve, reject) => {
                this._authorService.uploadAvatar(this.avatarFile!).subscribe({
                    next: resolve,
                    error: reject,
                });
            })
        );
    }

    Promise.all(requests)
        .then(() => {
            this.isSubmitting.set(false);
            this._router.navigate(['/author/dashboard']);
        })
        .catch((err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(err.error?.message ?? 'Failed to update profile');
        });
  }
}