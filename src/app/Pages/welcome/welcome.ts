import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, RouterLink, CommonModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.scss']
})
export class Welcome {
  slides = [
    { image: 'https://picsum.photos/id/1019/800/400', caption: 'Create polls in seconds' },
    { image: 'https://picsum.photos/id/1016/800/400', caption: 'Vote and share results instantly' },
    { image: 'https://picsum.photos/id/1025/800/400', caption: 'Engage your audience in real-time' }
  ];

  currentSlide = 0;

  ngOnInit() {
    // Auto slide every 3 seconds
    setInterval(() => this.nextSlide(), 3000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}
