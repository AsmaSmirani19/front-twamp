import { Component, OnInit } from '@angular/core';
import { AgentGroupService, AgentGroup } from './agent-group.service';
import { Agent, AgentService } from './agent.service';

@Component({
  selector: 'app-agent-group',
  templateUrl: './agent-group.component.html',
  styleUrls: ['./agent-group.component.scss']
})
export class AgentGroupComponent implements OnInit {
  public tableData: { headerRow: string[]; dataRows: AgentGroup[] } = {
    headerRow: ['Group Name', 'Number of Agents', 'Creation Date', 'Action'],
    dataRows: []
  };

  selectedGroup: AgentGroup | null = null;
  newGroupPopupVisible: boolean = false;
  searchTerm: string = '';

  // APRÈS :
  newGroup: any = {
  group_name: '',
  creation_date: new Date().toISOString().split('T')[0],
  agents: []  // On garde seulement la liste des agents
};

  availableAgents: Agent[] = [];
  filteredAgents: Agent[] = [];

  viewGroupPopupVisible: boolean = false;  // Variable pour afficher la popup de visualisation du groupe

  constructor(
    private agentGroupService: AgentGroupService,
    private agentService: AgentService
  ) {}
  
  ngOnInit(): void {
    this.loadAgents();
    this.loadAgentGroups();
  }
  

  loadAgentGroups(): void {
    this.agentGroupService.getAgentGroups().subscribe({
      next: (groups) => {
        console.log('Réponse brute groupes:', groups); 
        console.table(groups); // 🔥 Ajoute ça pour voir proprement
        this.tableData.dataRows = groups.map(g => ({
          ...g,
          agents: g.agents || [],
          number_of_agents: g.agents?.length || 0
        }));
        console.log('Groupes chargés après traitement:', this.tableData.dataRows);
      },
      error: (err) => console.error(err)
    });
  }
  
  

  loadAgents(): void {
    this.agentService.getAgents().subscribe({
      next: (data: Agent[]) => {
        this.availableAgents = data;
        this.filteredAgents = [...data];
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des agents', err);
      }
    });
  }

  onNewAgentGroup(): void {
    this.resetNewGroup();
    this.newGroupPopupVisible = true;
  }

  closePopup(): void {
    this.selectedGroup = null;
  }

  closeNewGroupPopup(): void {
    this.newGroupPopupVisible = false;
    this.resetNewGroup();
  }

  createGroup(): void {
    if (!this.newGroup.group_name.trim()) {
      alert('Le nom du groupe est requis.');
      return;
    }
  
    if (this.newGroup.agents.length === 0) {
      alert('Au moins un agent doit être sélectionné.');
      return;
    }
  
    const payloadForApi = {
      group_name: this.newGroup.group_name,
      number_of_agents: this.newGroup.agents.length,
      creation_date: new Date().toISOString(),
      agent_ids: this.newGroup.agents.map((agent: Agent) => agent.id) // 👈 ajouter les agents
    };
  
    this.agentGroupService.createAgentGroup(payloadForApi).subscribe({
      next: (createdGroup: AgentGroup) => {
        console.log('Groupe créé avec succès:', createdGroup);
        this.closeNewGroupPopup();
        this.loadAgentGroups();
      },
      error: (err) => {
        console.error('Erreur lors de la création du groupe:', err);
        alert('Une erreur est survenue lors de la création du groupe.');
      }
    });
  }
  

  resetNewGroup(): void {
    this.newGroup = {
      group_name: '',
      number_of_agents: 0,
      creation_date: new Date().toISOString().split('T')[0],
      agents: []
    };
    this.searchTerm = '';
    this.filteredAgents = [...this.availableAgents]; // Réinitialiser les agents filtrés
  }

  onSearchChange(): void {
    console.log('Search term:', this.searchTerm);
    const normalize = (text: string) =>
      text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  
    const term = normalize(this.searchTerm || '');
  
    this.filteredAgents = term
      ? this.availableAgents.filter(agent =>
          normalize(agent.name).includes(term)
        )
      : [...this.availableAgents];
  
    console.log('Filtered agents:', this.filteredAgents);
  }

  toggleSelectAll(checked: boolean): void {
    this.newGroup.agents = checked ? [...this.filteredAgents] : [];
  }

  toggleAgentSelection(agent: Agent): void {
    const index = this.newGroup.agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      this.newGroup.agents.splice(index, 1);
    } else {
      this.newGroup.agents.push({ ...agent });
    }

  }

  isAgentSelected(agent: Agent): boolean {
    return this.newGroup.agents.some(a => a.id === agent.id);
  }

  onDelete(group: AgentGroup): void {
    if (!group.id) {
      console.error('ID du groupe est manquant:', group);
      alert('Erreur : ID du groupe est manquant.');
      return;  // Empêche la suppression si l'ID est manquant
    }
  
    // Demander une confirmation avant de supprimer
    if (confirm(`Voulez-vous vraiment supprimer le groupe "${group.group_name}" ?`)) {
      this.agentGroupService.deleteAgentGroup(group.id).subscribe({
        next: () => {
          console.log('✅ Groupe supprimé avec succès');
          this.loadAgentGroups(); // Rafraîchir la liste après suppression
        },
        error: (err) => {
          console.error('❌ Erreur lors de la suppression du groupe', err);
          alert('Une erreur est survenue lors de la suppression du groupe.');
        }
      });
    }
  }

  // Nouvelle méthode pour afficher les détails du groupe sélectionné
  onView(row: AgentGroup): void {
    this.selectedGroup = {
      ...row,
      agents: row.agents || [] // Garantit la cohérence
    };
    console.log('Groupe sélectionné:', this.selectedGroup); // DEBUG
    this.viewGroupPopupVisible = true;
  }

  // Méthode pour fermer la popup d'affichage du groupe
  closeViewGroupPopup(): void {
    this.viewGroupPopupVisible = false;
    this.selectedGroup = null;
  }
}
