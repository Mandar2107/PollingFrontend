// src/app/Shared/footer/footer.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p>© 2025 PollMaster. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    .footer {
      flex-shrink: 0;
      text-align: center;
      padding: 10px 0;
      background-color: #1e1e2f;
      color: #fff;
      border-top: 1px solid #333;
    }
  `]
})
export class FooterComponent {}
