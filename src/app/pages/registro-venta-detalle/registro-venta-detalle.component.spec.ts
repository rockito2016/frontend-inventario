import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroVentaDetalleComponent } from './registro-venta-detalle.component';

describe('RegistroVentaDetalleComponent', () => {
  let component: RegistroVentaDetalleComponent;
  let fixture: ComponentFixture<RegistroVentaDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroVentaDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroVentaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
