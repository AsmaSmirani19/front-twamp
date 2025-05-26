import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AgentDetailsDialogComponent } from '../agent-details-dialog/agent-details-dialog.component';

// Définir l'interface pour les lignes de données
interface Row {
  group: string;
  numberOfAgents: number;
  status: string;
  createdAt: string;
  agents: { name: string, role: string, avatar: string }[];
}

@Component({
  selector: 'app-agent-group',
  templateUrl: './agent-group.component.html',
  styleUrls: ['./agent-group.component.css']
})
export class AgentGroupComponent {
  // Typage explicite de tableData
  tableData: { headerRow: any[], dataRows: Row[] } = { headerRow: [], dataRows: [] };

  constructor(private dialog: MatDialog) {}

  // Méthode pour ouvrir le dialogue des détails de l'agent
  onView(row: Row): void {
    this.dialog.open(AgentDetailsDialogComponent, {
      width: '600px',
      height: '400px',
      panelClass: 'centered-dialog',
      data: row
    });
  }

  // Méthode pour supprimer un groupe d'agents
  onDelete(row: Row): void {
    const index = this.tableData.dataRows.indexOf(row);
    if (index > -1) {
      this.tableData.dataRows.splice(index, 1);
    }
  }
}
