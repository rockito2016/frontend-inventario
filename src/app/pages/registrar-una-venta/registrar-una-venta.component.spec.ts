import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarUnaVentaComponent } from './registrar-una-venta.component';

describe('RegistrarUnaVentaComponent', () => {
  let component: RegistrarUnaVentaComponent;
  let fixture: ComponentFixture<RegistrarUnaVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarUnaVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarUnaVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
