import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroCompraGeneralComponent } from './registro-compra-general.component';

describe('RegistroCompraGeneralComponent', () => {
  let component: RegistroCompraGeneralComponent;
  let fixture: ComponentFixture<RegistroCompraGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroCompraGeneralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroCompraGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
