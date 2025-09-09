import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent {
  sidebarActive = false;
  pageTitle = 'Dashboard';

  constructor(private authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  private updatePageTitle() {
    const currentRoute = this.router.url;

    if (currentRoute.includes('home')) {
      this.pageTitle = 'Home';
    } else if (currentRoute.includes('polls')) {
      this.pageTitle = 'My Polls';
    } else if (currentRoute.includes('poll-dashboard')) {
      this.pageTitle = 'All Polls';
    } else if (currentRoute.includes('profile')) {
      this.pageTitle = 'Profile';
    } else {
      this.pageTitle = 'Dashboard';
    }
  }
}
