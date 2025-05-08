import { Component, OnInit } from '@angular/core';
import { AgentService, Agent } from './agent.service';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.css']
})
export class AgentListComponent implements OnInit {
  public headerRow: string[] = [
    'Agent Name',
    'Address',
    'Test Health',
    'Availability (Test)',
  ];

  public agents: Agent[] = []; 
  public searchTerm: string = '';
  public newAgentPopupVisible = false;
  public newAgent: Agent = this.getEmptyAgent();

  constructor(private agentService: AgentService) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  private getEmptyAgent(): Agent {
    return {
      id: undefined,
      name: '',
      address: '',
      port: 8080,
      testHealth: false,
      availability: 100,
    };
  }

  loadAgents(): void {
    this.agentService.getAgents().subscribe({
      next: (data) => {
        console.log('Agents chargés depuis l’API :', data);
        this.agents = data ?? []; // ✅ fallback vide si null
      },
      error: (err) => {
        console.error('Erreur lors du chargement des agents :', err);
        this.agents = []; // ✅ évite une erreur dans le getter
      }
    });
  }

  get filteredAgents(): Agent[] {
    const lowerTerm = this.searchTerm?.toLowerCase() || '';
    return (this.agents ?? []).filter(agent =>
      agent.name.toLowerCase().includes(lowerTerm) ||
      agent.address.toLowerCase().includes(lowerTerm)
    );
  }

  onNewAgent(): void {
    this.newAgent = this.getEmptyAgent();
    this.newAgentPopupVisible = true;
  }

  createAgent(): void {
    if (this.newAgent.name && this.newAgent.address) {
      this.agentService.createAgent(this.newAgent).subscribe({
        next: () => {
          this.loadAgents(); // Recharge la liste
          this.newAgent = this.getEmptyAgent();
          this.newAgentPopupVisible = false;
        },
        error: (err) => {
          console.error('Erreur lors de la création de l’agent :', err);
        }
      });
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  }

  deleteAgent(id: number): void {
    console.log('Tentative suppression ID :', id); 
    this.agentService.deleteAgent(id).subscribe({
      next: () => {
        this.agents = this.agents.filter(agent => agent.id !== id);
      },
      error: (err) => {
        console.error('Erreur suppression :', err);
      }
    });
  }  
}
