import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../Core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay" *ngIf="loaderService.loading$ | async">
      <div class="spinner"></div>
    </div>
  `,
  styleUrls: ['./loader.scss']
})
export class LoaderComponent {
  constructor(public loaderService: LoaderService) {}
}
