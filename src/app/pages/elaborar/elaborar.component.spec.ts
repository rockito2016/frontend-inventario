import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElaborarComponent } from './elaborar.component';

describe('ElaborarComponent', () => {
  let component: ElaborarComponent;
  let fixture: ComponentFixture<ElaborarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElaborarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElaborarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
