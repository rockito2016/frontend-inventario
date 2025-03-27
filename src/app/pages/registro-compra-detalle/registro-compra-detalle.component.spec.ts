import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCompraDetalleComponent } from './registro-compra-detalle.component';

describe('RegistroCompraDetalleComponent', () => {
  let component: RegistroCompraDetalleComponent;
  let fixture: ComponentFixture<RegistroCompraDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroCompraDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroCompraDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
