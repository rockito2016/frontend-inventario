import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulacionComponent } from './formulacion.component';

describe('FormulacionComponent', () => {
  let component: FormulacionComponent;
  let fixture: ComponentFixture<FormulacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
