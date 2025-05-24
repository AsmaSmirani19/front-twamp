import { Component, OnInit } from '@angular/core';
import { AgentService } from './agent.service';
import { WsService } from './ws.service';
import { Agent, HealthUpdate, HealthCheckResult } from './model';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.css']
})
export class AgentListComponent implements OnInit {
  public headerRow: string[] = [
    'Agent Name',
    'Address',
    'Port',
    'Test Health',
  ];

  public agents: Agent[] = [];
  public searchTerm: string = '';
  public newAgentPopupVisible = false;
  public newAgent: Agent = this.getEmptyAgent();

  constructor(
    private agentService: AgentService,
    private wsService: WsService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.wsService.getHealthStream().subscribe({
      next: (update: HealthUpdate) => {
        const agent = this.agents.find(a => a.address === update.ip);
        if (agent) {
          agent.testHealth = update.status?.toUpperCase() === 'OK';
          // Force la mise à jour de l'affichage
          this.agents = [...this.agents];
        }
      },
      error: (err) => {
        console.error('Erreur WebSocket:', err);
      }
    });
  }

 private getEmptyAgent(): Agent {
    return {
      id: undefined,
      name: '',
      address: '',
      testHealth: false,
      healthChecks: []
    };
  }

loadAgents(): void {
  this.agentService.getAgents().subscribe({
    next: (data: any[] | null) => {
      console.log('Données reçues de l\'API:', data);

      this.agents = (data ?? []).map(agent => {
        console.log('Agent brut:', agent);

        const rawHealth = agent.testHealth ?? agent.testhealth ?? agent.test_health ?? agent.TestHealth ?? agent.healthStatus ?? false;

        const testHealth = (typeof rawHealth === 'string')
          ? rawHealth.toLowerCase() === 'true'
          : Boolean(rawHealth);

        console.log(`Valeur normalisée de testHealth pour ${agent.name}:`, testHealth);

        return {
          id: agent.id,
          name: agent.name || 'N/A',
          address: agent.address || 'N/A',
          port: agent.port || agent.Port || 0,
          testHealth: testHealth,  // <-- majuscule, correspond au type Agent
          healthChecks: ((agent.healthChecks ?? agent.HealthChecks) ?? []).map((check: any) => ({
            timestamp: check.timestamp ? new Date(check.timestamp) : new Date(),
            status: check.status || 'UNKNOWN'
          }))
        };
      });

      console.log('Agents transformés:', this.agents);

      // Ne réaffecte pas filteredAgents si c'est readonly
      // Au lieu de ça, tu peux vider et remplir filteredAgents si c'est un tableau mutable
      if (this.filteredAgents && Array.isArray(this.filteredAgents)) {
        this.filteredAgents.length = 0;
        this.filteredAgents.push(...this.agents);
      }
    },
    error: (err) => {
      console.error('Erreur lors du chargement des agents :', err);
      this.agents = [];
      alert('Erreur lors du chargement des agents. Voir la console pour plus de détails.');
    }
  });
}


 private normalizeTestHealth(agent: any): boolean {
  // Ajoutez toutes les variantes possibles (y compris celles en minuscules)
  return agent.testHealth ?? 
         agent.testhealth ??  // <-- Variante minuscule
         agent.healthStatus ?? 
         agent.test_health ?? 
         agent.TestHealth ?? 
         agent.healthy ?? 
         false;
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
          this.loadAgents();
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
