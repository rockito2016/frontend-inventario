import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditosComprasComponent } from './creditos-compras.component';

describe('CreditosComprasComponent', () => {
  let component: CreditosComprasComponent;
  let fixture: ComponentFixture<CreditosComprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditosComprasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditosComprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
