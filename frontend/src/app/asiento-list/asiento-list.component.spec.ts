import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsientoListComponent } from './asiento-list.component';

describe('AsientoListComponent', () => {
  let component: AsientoListComponent;
  let fixture: ComponentFixture<AsientoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsientoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsientoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
