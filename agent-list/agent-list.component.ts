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
    'Action'
  ];

  public agents: Agent[] = [];
  public searchTerm: string = '';
  public newAgentPopupVisible = false;
  public newAgent: Agent = this.getEmptyAgent();

  constructor(private agentService: AgentService) {}

  ngOnInit() {
    this.loadAgents();
  }

  private getEmptyAgent(): Agent {
    return {
      name: '',
      address: '',
      port: 8080,
      testHealth: false,
      availability: 100,
    };
  }

  loadAgents(): void {
    this.agentService.getAgents().subscribe((data) => {
      this.agents = data;
    });
  }

  get filteredAgents(): Agent[] {
    const lowerTerm = this.searchTerm?.toLowerCase() || '';
    return this.agents.filter(agent =>
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
      this.agentService.createAgent(this.newAgent).subscribe(() => {
        this.loadAgents();
        this.newAgent = this.getEmptyAgent();
        this.newAgentPopupVisible = false;
      });
    } else {
      alert('Veuillez remplir tous les champs.');
    }
  }

  deleteAgent(index: number): void {
    const agentToDelete = this.agents[index];
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      this.agentService.deleteAgent(agentToDelete.id!).subscribe(() => {
        this.loadAgents();
      });
    }
  }
}
