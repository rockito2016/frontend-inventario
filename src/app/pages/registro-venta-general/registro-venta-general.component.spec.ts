import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroVentaGeneralComponent } from './registro-venta-general.component';

describe('RegistroVentaGeneralComponent', () => {
  let component: RegistroVentaGeneralComponent;
  let fixture: ComponentFixture<RegistroVentaGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroVentaGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroVentaGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
