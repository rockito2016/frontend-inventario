import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProximosVencerComponent } from './proximos-vencer.component';

describe('ProximosVencerComponent', () => {
  let component: ProximosVencerComponent;
  let fixture: ComponentFixture<ProximosVencerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProximosVencerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProximosVencerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
