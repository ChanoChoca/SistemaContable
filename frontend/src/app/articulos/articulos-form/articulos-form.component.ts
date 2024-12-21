import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Articulos} from "../../models/articulos";
import {faXmark} from "@fortawesome/free-solid-svg-icons/faXmark";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ArticulosService} from "../../services/articulos.service";
import {ActivatedRoute, Router} from "@angular/router";

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
  articuloExists: boolean = false; // Variable para saber si el artículo existe

  constructor(
    private fb: FormBuilder,
    private articulosService: ArticulosService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.articuloForm = this.fb.group({
      nombre: ['', [Validators.required]],
      precioUnitario: ['', [Validators.required, Validators.min(0)]],
      stockActual: ['', [Validators.required, Validators.min(0)]]
    });

    // Escuchar cambios en el nombre
    this.articuloForm.get('nombre')?.valueChanges.subscribe(value => {
      if (value) {
        this.checkArticuloExistence(value);
      }
    });
  }

  ngOnInit(): void {
    const articuloId = this.route.snapshot.paramMap.get('id');
    if (articuloId) {
      this.articulosService.getArticuloById(+articuloId).subscribe({
        next: articulo => {
          this.articuloToEdit = articulo;
          this.articuloForm.patchValue(articulo);
          if (this.articuloToEdit) {
            this.articuloForm.get('nombre')?.disable(); // Desactivar el campo nombre
          }
        },
        error: err => {
          console.error('Error al cargar el artículo', err);
        }
      });
    }
  }

  checkArticuloExistence(nombre: string): void {
    // Verificar si el nombre es el mismo que el artículo en edición
    if (this.articuloToEdit && this.articuloToEdit.nombre === nombre) {
      this.articuloExists = false;  // No consideramos que el nombre ya exista si estamos editando el mismo artículo
      this.articuloForm.get('nombre')?.setErrors(null);  // Limpiar el error si el nombre es el mismo
      return;
    }

    // Si el nombre es diferente, hacer la consulta
    this.articulosService.checkArticuloByName(nombre).subscribe(exists => {
      this.articuloExists = exists;
      if (this.articuloExists) {
        this.articuloForm.get('nombre')?.setErrors({ nombreExistente: true }); // Establecer un error en el campo nombre
      } else {
        this.articuloForm.get('nombre')?.setErrors(null); // Limpiar el error si no existe
      }
    });
  }

  saveArticulo(): void {
    if (this.articuloForm.valid && !this.articuloExists) {
      const newArticulo: Articulos = {
        id: undefined,
        fechaCreacion: this.articuloToEdit ? this.articuloToEdit.fechaCreacion : new Date(),
        nombre: this.articuloToEdit ? this.articuloToEdit.nombre : this.articuloForm.getRawValue().nombre,
        precioUnitario: this.articuloForm.get('precioUnitario')?.value,
        stockActual: this.articuloForm.get('stockActual')?.value
      };

      this.articulosService.createArticulo(newArticulo);
      this.router.navigate(['/articulos']).then(() => this.resetForm());
    }
  }

  cancel(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.articuloForm.reset();
    this.articuloToEdit = null;
  }

  protected readonly faXmark = faXmark;
}
