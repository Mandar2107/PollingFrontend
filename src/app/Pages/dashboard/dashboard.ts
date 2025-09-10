import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../Core/services/auth.service';
import { filter } from 'rxjs/operators';
import { ChatComponent } from "../chat-component/chat-component";
import { CommonModule } from '@angular/common';

interface UserProfile {
  username: string;
  email: string;
  status: string;
  avatarUrl: string;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, ChatComponent ,CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  sidebarActive = false;
  pageTitle = 'Dashboard';

 user: UserProfile = {
    username: '',
    email: '',
    status: 'Active',
    avatarUrl: 'https://tse4.mm.bing.net/th/id/OIP.oM71KD-EN9AG92eLdv6WwwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'
  };
    newUsername: string = '';
  newEmail: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updatePageTitle();
      });
  }

  ngOnInit() {
   this.loadLoggedInUser();
  }
dropdownOpen = false;

toggleDropdown() {
  this.dropdownOpen = !this.dropdownOpen;
}
showChat = false;

  // toggle chat panel
  toggleChat() {
    this.showChat = !this.showChat;
  }


// Close dropdown if clicked outside
@HostListener('document:click', ['$event'])
onClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-info')) {
    this.dropdownOpen = false;
  }
}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }

  loadLoggedInUser() {
    const userData = localStorage.getItem('loggedInUser');
    if (userData) {
      const savedUser = JSON.parse(userData);
      this.user = { ...this.user, ...savedUser };
      this.newUsername = this.user.username;
      this.newEmail = this.user.email;
      return;
    }


    const token = this.authService.getToken();
    if (token) {
      try {
        const decoded: any = JSON.parse(atob(token.split('.')[1]));
        this.user.username = decoded.FullName || '';
        this.user.email = decoded.unique_name || '';
        this.newUsername = this.user.username;
        this.newEmail = this.user.email;
      } catch {
        console.warn('Cannot decode token');
      }
    }
  }

  get userInitials(): string {
    if (!this.user.username) return '';
    return this.user.username
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
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
