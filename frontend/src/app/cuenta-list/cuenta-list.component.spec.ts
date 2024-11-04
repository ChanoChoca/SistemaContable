import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaListComponent } from './cuenta-list.component';

describe('CuentaListComponent', () => {
  let component: CuentaListComponent;
  let fixture: ComponentFixture<CuentaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuentaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
