import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faChevronUp} from "@fortawesome/free-solid-svg-icons/faChevronUp";

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
  protected readonly faChevronUp = faChevronUp;
}
