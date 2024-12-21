import {Component, inject, OnInit} from '@angular/core';
import {Articulos} from "../models/articulos";
import {AuthService} from "../core/auth/auth.service";
import {RouterLink} from "@angular/router";
import {ArticulosService} from "../services/articulos.service";

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
  articulosService = inject(ArticulosService);
  authService = inject(AuthService);

  constructor() {}

  ngOnInit(): void {
    // Cargar los artículos desde el backend
    this.articulosService.getArticulos().subscribe({
      next: articulos => {
        this.articulos = articulos;
      },
      error: err => {
        console.error('Error al obtener los artículos', err);
      }
    });
  }
}
