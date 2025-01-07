import { TestBed } from '@angular/core/testing';

import { ArcaService } from './arca.service';

describe('ArcaService', () => {
  let service: ArcaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArcaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
