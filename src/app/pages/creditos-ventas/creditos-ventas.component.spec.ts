import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditosVentasComponent } from './creditos-ventas.component';

describe('CreditosVentasComponent', () => {
  let component: CreditosVentasComponent;
  let fixture: ComponentFixture<CreditosVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditosVentasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditosVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
