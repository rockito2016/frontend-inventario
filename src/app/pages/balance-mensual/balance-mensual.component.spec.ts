import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceMensualComponent } from './balance-mensual.component';

describe('BalanceMensualComponent', () => {
  let component: BalanceMensualComponent;
  let fixture: ComponentFixture<BalanceMensualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceMensualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceMensualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
