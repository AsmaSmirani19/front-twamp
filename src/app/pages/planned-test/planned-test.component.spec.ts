import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannedTestComponent } from './planned-test.component';

describe('PlannedTestComponent', () => {
  let component: PlannedTestComponent;
  let fixture: ComponentFixture<PlannedTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlannedTestComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannedTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
