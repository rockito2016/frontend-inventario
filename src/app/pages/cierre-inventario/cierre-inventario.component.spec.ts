import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CierreInventarioComponent } from './cierre-inventario.component';

describe('CierreInventarioComponent', () => {
  let component: CierreInventarioComponent;
  let fixture: ComponentFixture<CierreInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CierreInventarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CierreInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
