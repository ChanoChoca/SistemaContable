import { TestBed } from '@angular/core/testing';

import { ArticulosVentasService } from './articulos-ventas.service';

describe('ArticulosVentasService', () => {
  let service: ArticulosVentasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArticulosVentasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
