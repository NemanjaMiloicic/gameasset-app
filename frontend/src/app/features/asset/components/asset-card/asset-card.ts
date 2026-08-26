import { Component, input, output } from '@angular/core';
import { Asset } from '../../interfaces/asset.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-asset-card',
  imports: [RouterLink],
  templateUrl: './asset-card.html',
  styleUrl: './asset-card.css',
})
export class AssetCard {
  asset = input.required<Asset>();
  cardClicked = output<string>();

  onCardClick(): void {
    this.cardClicked.emit(this.asset().id);
  }
}