import {Component, inject} from '@angular/core';
import {RouterLink} from "@angular/router";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faChevronUp} from "@fortawesome/free-solid-svg-icons/faChevronUp";
import {AuthService} from "../core/auth/auth.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    FontAwesomeModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  authService = inject(AuthService);

  protected readonly faChevronUp = faChevronUp;
}
