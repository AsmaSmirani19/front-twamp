import { Component, OnInit } from '@angular/core';
import { AgentService } from '../agent-list/agent.service';
import { TestProfileService } from '../test-profile/test-profile.service';
import { ThresholdService } from '../threshold/threshold.service';
import { TestProfile } from '../test-profile/test-profile.model'; 

@Component({
  selector: 'app-quick-test',
  templateUrl: './quick-test.component.html',
  styleUrls: ['./quick-test.component.css']
})
export class QuickTestComponent implements OnInit {
  agents: any[] = [];
  testProfiles: any[] = [];
  thresholds: any[] = []; // Pour être cohérent

  // Toutes les valeurs du formulaire
  testForm = {
    name: '',
    duration: 0,
    nbTests: 0,
    agentSource: '',
    agentDestination: '',
    qosProfile: '',
    threshold: 0
  };

  constructor(
    private agentService: AgentService,
    private testProfileService: TestProfileService,
    private thresholdService: ThresholdService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    console.log('Chargement du composant');
    this.loadTestProfiles();
    this.loadThresholds();
  }

  loadAgents(): void {
    this.agentService.getAgents().subscribe({
      next: (agents: any[]) => {
        console.log('Agents récupérés :', agents);
        this.agents = agents;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des agents :', err);
      }
    });
  }

  loadTestProfiles(): void {
    this.testProfileService.getTestProfiles().subscribe({
      next: (profiles) => {
        console.log('Profils reçus brut:', profiles);
  
        this.testProfiles = profiles;
  
        console.log('testProfiles après affectation:', JSON.stringify(this.testProfiles, null, 2));
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des profils de test :', err);
      }
    });
  }
  
  

  loadThresholds(): void {
    this.thresholdService.getThresholds().subscribe({
      next: (thresholds: any[]) => {
        console.log('Thresholds récupérés :', thresholds);
        this.thresholds = thresholds;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des thresholds :', error);
      }
    });
  }

  onSubmit(): void {
    console.log('Détails du test soumis :', this.testForm);
  }
}
