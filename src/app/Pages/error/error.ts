import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  templateUrl: './error.html',
  imports: [RouterLink ],
  styleUrls: ['./error.scss']
})
export class ErrorComponent {
  errorCode = '404';
  errorMessage = 'Page Not Found';

  constructor(private router: Router) {}

  
}
