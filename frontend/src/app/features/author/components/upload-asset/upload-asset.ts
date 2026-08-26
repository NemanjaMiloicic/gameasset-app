import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AssetService } from '../../../asset/asset.service';
import { CreateAssetPayload } from '../../../asset/interfaces/create-asset-payload.interface';
import { Asset } from '../../../asset/interfaces/asset.interface';

@Component({
  selector: 'app-upload-asset',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './upload-asset.html',
  styleUrl: './upload-asset.css',
})
export class UploadAsset {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _assetService = inject(AssetService);
  private readonly _router = inject(Router);

  createdAsset = signal<Asset | null>(null);
  errorMessage = signal('');
  isSubmitting = signal(false);

  tags = signal<string[]>([]);
  tagInput = '';

  previewFile: File | null = null;
  assetFiles: File[] = [];
  isUploadingFiles = signal(false);

  assetForm = this._formBuilder.group({
    title: ['', [Validators.required, Validators.maxLength(25)]],
    description: ['', [Validators.required, Validators.maxLength(350)]],
    assetType: ['tileset', [Validators.required]],
    price: [0, [Validators.required]],
    licenseType: ['nothing', [Validators.required]],
  });

  addTag(): void {
    const value = this.tagInput.trim();
    if (value && !this.tags().includes(value)) {
      this.tags.update((current) => [...current, value]);
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.tags.update((current) => current.filter((t) => t !== tag));
  }

  onSubmitMeta(): void {
    if (this.assetForm.invalid) {
      return;
    }

    const payload: CreateAssetPayload = {
      title: this.assetForm.value.title!,
      description: this.assetForm.value.description!,
      assetType: this.assetForm.value.assetType!,
      price: this.assetForm.value.price!,
      licenseType: this.assetForm.value.licenseType!,
      tags: this.tags(),
    };

    this.isSubmitting.set(true);
    this._assetService.create(payload).subscribe({
      next: (asset) => {
        this.isSubmitting.set(false);
        this.createdAsset.set(asset);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Failed to create asset');
      },
    });
  }

  onPreviewSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.previewFile = input.files?.[0] ?? null;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.assetFiles = input.files ? Array.from(input.files) : [];
  }

  onFinishUpload(): void {
    const asset = this.createdAsset();
    if (!asset) return;

    this.isUploadingFiles.set(true);

    const uploads: Promise<any>[] = [];

    if (this.previewFile) {
      uploads.push(
        new Promise((resolve, reject) => {
          this._assetService.uploadPreviewImage(asset.id, this.previewFile!).subscribe({
            next: resolve,
            error: reject,
          });
        })
      );
    }

    if (this.assetFiles.length > 0) {
      uploads.push(
        new Promise((resolve, reject) => {
          this._assetService.uploadFiles(asset.id, this.assetFiles).subscribe({
            next: resolve,
            error: reject,
          });
        })
      );
    }

    Promise.all(uploads)
      .then(() => {
        this._router.navigate(['/author/assets']);
      })
      .catch((err) => {
        this.isUploadingFiles.set(false);
        this.errorMessage.set(err.error?.message ?? 'Upload failed');
      });
  }
}