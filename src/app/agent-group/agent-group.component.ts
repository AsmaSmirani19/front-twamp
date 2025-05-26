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
  viewGroupPopupVisible = false;
  newGroupPopupVisible = false;
  searchTerm = '';

  newGroup: {
    group_name: string;
    creation_date: string;
    agents: Agent[];
  } = {
    group_name: '',
    creation_date: new Date().toISOString().split('T')[0],
    agents: []
  };

  availableAgents: Agent[] = [];
  filteredAgents: Agent[] = [];

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
        console.log('📥 Données brutes reçues du backend:', groups);
  
        this.tableData.dataRows = groups;
  
        console.log('📊 DataRows affectés:', this.tableData.dataRows);
      },
      error: (err) => console.error('Erreur chargement groupes:', err)
    });
  }
  
  

  // 📦 Chargement des agents
  loadAgents(): void {
    this.agentService.getAgents().subscribe({
      next: (data) => {
        this.availableAgents = data;
        this.filteredAgents = [...data];
      },
      error: (err) => console.error('Erreur chargement agents:', err)
    });
  }

  // ➕ Afficher popup création
  onNewAgentGroup(): void {
    this.resetNewGroup();
    this.newGroupPopupVisible = true;
  }

  // ❌ Fermer popup création
  closeNewGroupPopup(): void {
    this.newGroupPopupVisible = false;
    this.resetNewGroup();
  }

  // ❌ Fermer popup vue
  closeViewGroupPopup(): void {
    this.viewGroupPopupVisible = false;
    this.selectedGroup = null;
  }

  // 🔁 Reset du formulaire
  resetNewGroup(): void {
    this.newGroup = {
      group_name: '',
      creation_date: new Date().toISOString().split('T')[0],
      agents: []
    };
    this.searchTerm = '';
    this.filteredAgents = [...this.availableAgents];
  }

  // 🔍 Filtrage d’agents
  onSearchChange(): void {
    const normalize = (text: string) =>
      text?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const term = normalize(this.searchTerm || '');
    this.filteredAgents = term
      ? this.availableAgents.filter(agent => normalize(agent.name).includes(term))
      : [...this.availableAgents];
  }

  // ✅ Créer un nouveau groupe
  createGroup(): void {
    if (!this.newGroup.group_name.trim()) {
      alert('Le nom du groupe est requis.');
      return;
    }

    if (this.newGroup.agents.length === 0) {
      alert('Au moins un agent doit être sélectionné.');
      return;
    }

    const payload = {
      group_name: this.newGroup.group_name,
      creation_date: new Date().toISOString()
    };

    this.agentGroupService.createAgentGroup(payload).subscribe({
      next: (createdGroup) => {
        const linkPayload = {
          group_id: createdGroup.id,
          agent_ids: this.newGroup.agents.map(agent => agent.id)
        };
        console.log('🔗 Envoi liaison agents:', linkPayload);
        this.agentService.linkAgentsToGroup(linkPayload).subscribe({
          next: () => {
            console.log('✅ Agents liés avec succès');
            this.closeNewGroupPopup();
            this.loadAgentGroups();
          },
          error: (err) => {
            console.error('Erreur liaison agents:', err);
            alert('Erreur lors de la liaison des agents au groupe.');
          }
        });
      },
      error: (err) => {
        console.error('Erreur création groupe:', err);
        alert('Une erreur est survenue lors de la création du groupe.');
      }
    });
  }

  // 👁 Afficher les détails d’un groupe
  onView(group: AgentGroup): void {
    if (!group.id) return;

    this.agentService.getAgentsByGroup(group.id).subscribe({
      next: (agents) => {
        this.selectedGroup = { ...group, agents };
        this.viewGroupPopupVisible = true;
      },
      error: (err) => {
        console.error('Erreur chargement agents liés:', err);
        alert('Impossible de charger les agents du groupe.');
      }
    });
  }

  // ❌ Supprimer un groupe
  onDelete(group: AgentGroup): void {
    if (!group.id) {
      alert('Erreur : ID du groupe est manquant.');
      return;
    }

    if (confirm(`Voulez-vous vraiment supprimer le groupe "${group.group_name}" ?`)) {
      this.agentGroupService.deleteAgentGroup(group.id).subscribe({
        next: () => this.loadAgentGroups(),
        error: (err) => {
          console.error('Erreur suppression groupe:', err);
          alert('Une erreur est survenue lors de la suppression du groupe.');
        }
      });
    }
  }

  // 🔄 Sélectionner tous les agents
  toggleSelectAll(checked: boolean): void {
    this.newGroup.agents = checked ? [...this.filteredAgents] : [];
  }

  // ✅/❌ Sélectionner / désélectionner un agent
  toggleAgentSelection(agent: Agent): void {
    const index = this.newGroup.agents.findIndex(a => a.id === agent.id);
    if (index >= 0) {
      this.newGroup.agents.splice(index, 1);
    } else {
      this.newGroup.agents.push({ ...agent });
    }
  }

  // ✔ Vérifie si un agent est sélectionné
  isAgentSelected(agent: Agent): boolean {
    return this.newGroup.agents.some(a => a.id === agent.id);
  }

  // ➕ Ajouter un agent à un groupe existant
  addAgent(agent: Agent): void {
    if (!this.selectedGroup) return;

    this.agentService.addAgentToGroup(this.selectedGroup.id!, agent.id!).subscribe({
      next: () => {
        this.selectedGroup?.agents.push(agent);
      },
      error: (err) => {
        console.error('Erreur ajout agent:', err);
        alert('Erreur lors de l’ajout de l’agent.');
      }
    });
  }

  // ➖ Supprimer un agent d’un groupe
  removeAgent(agent: Agent): void {
    if (!this.selectedGroup) return;

    this.agentService.removeAgentFromGroup(this.selectedGroup.id!, agent.id!).subscribe({
      next: () => {
        this.selectedGroup!.agents = this.selectedGroup!.agents.filter(a => a.id !== agent.id);
      },
      error: (err) => {
        console.error('Erreur suppression agent:', err);
        alert('Erreur lors de la suppression de l’agent.');
      }
    });
  }
}
