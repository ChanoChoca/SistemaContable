import {Component, inject, OnInit} from '@angular/core';
import {Articulos} from "../models/articulos";
import {AuthService} from "../core/auth/auth.service";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-articulos',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './articulos.component.html',
  styleUrl: './articulos.component.css'
})
export class ArticulosListaComponent implements OnInit {
  articulos: Articulos[] = [];
  authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    // Cargar los artículos desde localStorage
    const articulosStorage = localStorage.getItem('articulos');
    if (articulosStorage) {
      this.articulos = JSON.parse(articulosStorage);
    }
  }
}
