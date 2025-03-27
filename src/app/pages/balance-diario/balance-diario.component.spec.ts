import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceDiarioComponent } from './balance-diario.component';

describe('BalanceDiarioComponent', () => {
  let component: BalanceDiarioComponent;
  let fixture: ComponentFixture<BalanceDiarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceDiarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceDiarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
