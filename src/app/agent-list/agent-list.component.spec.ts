/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AgentListComponent } from './agent-list.component';

describe('TablesComponent', () => {
  let component: AgentListComponent;
  let fixture: ComponentFixture<AgentListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
