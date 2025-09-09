import { Welcome } from './Pages/welcome/welcome';
import { Component, signal } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { LoaderComponent } from "./Pages/loader/loader";
import { FooterComponent } from "./Pages/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',

})
export class App {
  protected readonly title = signal('polling-app');
}
