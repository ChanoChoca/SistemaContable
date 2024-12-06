import { TestBed } from '@angular/core/testing';

import { CuentaAsientoService } from './cuenta-asiento.service';

describe('CuentaAsientoService', () => {
  let service: CuentaAsientoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CuentaAsientoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
