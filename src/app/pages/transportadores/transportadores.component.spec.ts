import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransportadoresComponent } from './transportadores.component';

describe('TransportadoresComponent', () => {
  let component: TransportadoresComponent;
  let fixture: ComponentFixture<TransportadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransportadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransportadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
