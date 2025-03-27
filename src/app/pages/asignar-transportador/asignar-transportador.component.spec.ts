import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarTransportadorComponent } from './asignar-transportador.component';

describe('AsignarTransportadorComponent', () => {
  let component: AsignarTransportadorComponent;
  let fixture: ComponentFixture<AsignarTransportadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarTransportadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarTransportadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
