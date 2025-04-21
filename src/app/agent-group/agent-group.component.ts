import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AgentDetailsDialogComponent } from '../agent-details-dialog/agent-details-dialog.component';

interface Agent {
  name: string;
  role: string;
  avatar: string;
}

interface AgentGroup {
  group: string;
  numberOfAgents: number;
  status: string;
  createdAt?: string;
  agents: Agent[];
}

@Component({
  selector: 'app-agent-group',
  templateUrl: './agent-group.component.html',
  styleUrls: ['./agent-group.component.scss']
})
export class AgentGroupComponent implements OnInit {
  public tableData: {
    headerRow: string[];
    dataRows: AgentGroup[];
  };

  selectedGroup: AgentGroup | null = null;  // Initialisation de selectedGroup

  constructor(private router: Router, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.tableData = {
      headerRow: ['Group Name', 'Numbers of Agent', 'Creation Date', 'Action'],
      dataRows: [
        {
          group: 'Group Alpha',
          numberOfAgents: 5,
          status: 'Active',
          createdAt: '2024-12-09 15:58:28',
          agents: [
            { name: 'Alice Martin', role: 'Manager', avatar: 'https://i.pravatar.cc/60?img=1' },
            { name: 'Bob Dupont', role: 'Agent', avatar: 'https://i.pravatar.cc/60?img=2' }
          ]
        },
        {
          group: 'Group Beta',
          numberOfAgents: 3,
          status: 'Inactive',
          createdAt: '2024-11-05 10:21:10',
          agents: [
            { name: 'Claire Laurent', role: 'Supervisor', avatar: 'https://i.pravatar.cc/60?img=3' },
            { name: 'David Moreau', role: 'Agent', avatar: 'https://i.pravatar.cc/60?img=4' }
          ]
        },
        {
          group: 'Group Gamma',
          numberOfAgents: 8,
          status: 'Active',
          createdAt: '2024-10-01 08:45:00',
          agents: [
            { name: 'Eva Durand', role: 'Manager', avatar: 'https://i.pravatar.cc/60?img=5' },
            { name: 'Félix Petit', role: 'Agent', avatar: 'https://i.pravatar.cc/60?img=6' }
          ]
        }
      ]
    };
  }

  onNewAgentGroup(): void {
    console.log('New Agent Group button clicked');
    // Tu peux ici rediriger ou ouvrir une autre modale
  }

  onView(row: AgentGroup): void {
    this.selectedGroup = row;  // Affectation du groupe sélectionné
  }

  closePopup(): void {
    this.selectedGroup = null;  // Ferme la popup en réinitialisant selectedGroup
  }

  onEdit(row: AgentGroup): void {
    console.log('Edit group:', row);
    // Action à implémenter plus tard
  }

  onDelete(row: AgentGroup): void {
    console.log('Delete group:', row);
    const index = this.tableData.dataRows.indexOf(row);
    if (index !== -1) {
      this.tableData.dataRows.splice(index, 1);  // Supprime le groupe du tableau
    }
  }
}
