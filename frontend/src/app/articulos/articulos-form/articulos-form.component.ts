import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Articulos} from "../../models/articulos";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";

@Component({
  selector: 'app-articulos-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FaIconComponent
  ],
  templateUrl: './articulos-form.component.html',
  styleUrl: './articulos-form.component.css'
})
export class ArticulosFormComponent implements OnInit {
  articuloForm: FormGroup;
  articuloToEdit: Articulos | null = null;

  constructor(private fb: FormBuilder) {
    this.articuloForm = this.fb.group({
      nombre: ['', [Validators.required]],
      precioUnitario: ['', [Validators.required, Validators.min(0)]],
      stockActual: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    // Verificar si estamos editando un artículo
    const articuloId = localStorage.getItem('editArticuloId');
    if (articuloId) {
      const articulosStorage = localStorage.getItem('articulos');
      if (articulosStorage) {
        const articulos: Articulos[] = JSON.parse(articulosStorage);
        this.articuloToEdit = articulos.find(art => art.id === parseInt(articuloId, 10)) || null;
        if (this.articuloToEdit) {
          this.articuloForm.patchValue(this.articuloToEdit);
        }
      }
    }
  }

  // Guardar artículo en localStorage
  saveArticulo(): void {
    if (this.articuloForm.valid) {
      const newArticulo: Articulos = {
        id: this.articuloToEdit ? this.articuloToEdit.id : Date.now(), // Si es nuevo, le damos un ID único basado en timestamp
        ...this.articuloForm.value
      };

      const articulosStorage = localStorage.getItem('articulos');
      let articulos: Articulos[] = articulosStorage ? JSON.parse(articulosStorage) : [];

      // Si estamos editando, actualizamos el artículo
      if (this.articuloToEdit) {
        articulos = articulos.map(articulo =>
          articulo.id === newArticulo.id ? newArticulo : articulo
        );
        localStorage.removeItem('editArticuloId'); // Limpiar el ID de edición
      } else {
        // Si es nuevo, lo añadimos
        articulos.push(newArticulo);
      }

      localStorage.setItem('articulos', JSON.stringify(articulos));
      this.articuloForm.reset(); // Limpiar el formulario
    }
  }

  // Cancelar y limpiar el formulario
  cancel(): void {
    this.articuloForm.reset();
    localStorage.removeItem('editArticuloId'); // Limpiar el ID de edición si existe
  }

  protected readonly faXmark = faXmark;
}
