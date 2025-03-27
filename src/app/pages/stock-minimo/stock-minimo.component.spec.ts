import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMinimoComponent } from './stock-minimo.component';

describe('StockMinimoComponent', () => {
  let component: StockMinimoComponent;
  let fixture: ComponentFixture<StockMinimoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockMinimoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockMinimoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
