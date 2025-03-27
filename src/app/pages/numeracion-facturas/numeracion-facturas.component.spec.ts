import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumeracionFacturasComponent } from './numeracion-facturas.component';

describe('NumeracionFacturasComponent', () => {
  let component: NumeracionFacturasComponent;
  let fixture: ComponentFixture<NumeracionFacturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumeracionFacturasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumeracionFacturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
