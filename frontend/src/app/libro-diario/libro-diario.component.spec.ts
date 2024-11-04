import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibroDiarioComponent } from './libro-diario.component';

describe('LibroDiarioComponent', () => {
  let component: LibroDiarioComponent;
  let fixture: ComponentFixture<LibroDiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibroDiarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibroDiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
