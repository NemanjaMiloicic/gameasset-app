import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { AuthorService } from '../../author.service';

@Component({
  selector: 'app-author-profile',
  imports: [],
  templateUrl: './author-profile.html',
  styleUrl: './author-profile.css',
})
export class AuthorProfile {
  private readonly _route = inject(ActivatedRoute);
  private readonly _authorService = inject(AuthorService);

  author = toSignal(
    this._route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id')!;
        return this._authorService.getPublicProfile(id);
      })
    )
  );
}