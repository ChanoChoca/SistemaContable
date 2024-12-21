import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfipComponent } from './afip.component';

describe('AfipComponent', () => {
  let component: AfipComponent;
  let fixture: ComponentFixture<AfipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
