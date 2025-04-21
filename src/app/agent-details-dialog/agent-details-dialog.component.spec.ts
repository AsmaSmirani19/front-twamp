import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentDetailsDialogComponent } from './agent-details-dialog.component';

describe('AgentDetailsDialogComponent', () => {
  let component: AgentDetailsDialogComponent;
  let fixture: ComponentFixture<AgentDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgentDetailsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
