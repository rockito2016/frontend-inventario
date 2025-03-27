import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElaboradoComponent } from './elaborado.component';

describe('ElaboradoComponent', () => {
  let component: ElaboradoComponent;
  let fixture: ComponentFixture<ElaboradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElaboradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElaboradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
