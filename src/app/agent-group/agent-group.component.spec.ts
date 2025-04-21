import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentGroupComponent } from './agent-group.component';
import { MatDialog } from '@angular/material/dialog';
import { AgentDetailsDialogComponent } from '../agent-details-dialog/agent-details-dialog.component';

describe('AgentGroupComponent', () => {
  let component: AgentGroupComponent;
  let fixture: ComponentFixture<AgentGroupComponent>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    
    await TestBed.configureTestingModule({
      declarations: [ AgentGroupComponent ],
      providers: [
        { provide: MatDialog, useValue: mockDialog }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the agent details dialog on view click', () => {
    const row = {
      group: 'Group Alpha',
      numberOfAgents: 5,
      status: 'Active',
      createdAt: '2024-12-09',
      agents: [
        { name: 'Alice Martin', role: 'Manager', avatar: 'https://i.pravatar.cc/60?img=1' },
        { name: 'Bob Dupont', role: 'Agent', avatar: 'https://i.pravatar.cc/60?img=2' }
      ]
    };
    component.onView(row);
    expect(mockDialog.open).toHaveBeenCalledWith(AgentDetailsDialogComponent, jasmine.objectContaining({
      width: '600px',
      height: '400px',
      panelClass: 'centered-dialog'
    }));
  });

  it('should delete the agent group', () => {
    const row = {
      group: 'Group Alpha',
      numberOfAgents: 5,
      status: 'Active',
      agents: []
    };
    component.tableData = {
      headerRow: [],
      dataRows: [row]
    };
    component.onDelete(row);
    expect(component.tableData.dataRows.length).toBe(0);
  });
});
