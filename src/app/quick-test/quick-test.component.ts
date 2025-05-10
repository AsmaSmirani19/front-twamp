import { Component, OnInit } from '@angular/core';
import { AgentService } from '../agent-list/agent.service';
import { TestProfileService } from '../test-profile/test-profile.service';
import { ThresholdService } from '../threshold/threshold.service';
import { QuickTestService } from './quick-test.service';
import { TestService, TestDto } from '../services/test.services';

@Component({
  selector: 'app-quick-test',
  templateUrl: './quick-test.component.html',
  styleUrls: ['./quick-test.component.css']
})
export class QuickTestComponent implements OnInit {
  agents: any[] = [];
  testProfiles: any[] = [];
  thresholds: any[] = [];
  quickTests: any[] = []; // Ajouté pour le tableau des tests rapides
  showQuickPopup: boolean = false; // Contrôle de l'affichage de la popup

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
    private thresholdService: ThresholdService,
    private quickTestService: QuickTestService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    this.loadAgents();
    this.loadTestProfiles();
    this.loadThresholds();
    this.loadQuickTests(); // Chargement des tests rapides existants
  }

  loadAgents(): void {
    this.agentService.getAgents().subscribe({
      next: (agents) => this.agents = agents,
      error: (err) => console.error('Erreur lors de la récupération des agents :', err)
    });
  }

  loadTestProfiles(): void {
    this.testProfileService.getTestProfiles().subscribe({
      next: (profiles) => this.testProfiles = profiles,
      error: (err) => console.error('Erreur lors de la récupération des profils de test :', err)
    });
  }

  loadThresholds(): void {
    this.thresholdService.getThresholds().subscribe({
      next: (thresholds) => this.thresholds = thresholds,
      error: (err) => console.error('Erreur lors du chargement des thresholds :', err)
    });
  }

  loadQuickTests(): void {
    this.testService.getTests().subscribe({
      next: (tests) => this.quickTests = tests,
      error: (err) => console.error('Erreur lors de la récupération des tests rapides :', err)
    });
  }
  

  openQuickTestPopup(): void {
    this.showQuickPopup = true;
  }

  closeQuickTestPopup(): void {
    this.showQuickPopup = false;
  }

  getAgentName(id: number): string {
    const agent = this.agents.find(a => a.id === id);
    return agent ? agent.name : 'Inconnu';
  }

  formatDuration(duration: string): string {
    return duration.replace('s', ' sec');
  }

  launchQuickTest(): void {
    const payload: TestDto = {
      test_name: this.testForm.name,
      test_duration: `${this.testForm.duration}s`,
      number_of_agents: this.testForm.nbTests,
      source_id: +this.testForm.agentSource,
      target_id: +this.testForm.agentDestination,
      profile_id: +this.testForm.qosProfile,
      threshold_id: +this.testForm.threshold,
      creation_date: new Date().toISOString(),
      test_type: 'quick_test',
      waiting: true,
      failed: false,
      completed: false
    };
  
    this.testService.createTest(payload).subscribe({
      next: () => {
        alert('✅ Test enregistré avec succès dans la base de données');
        this.closeQuickTestPopup();
        this.loadQuickTests(); // Mise à jour du tableau
      },
      error: (err) => alert('❌ Erreur lors de l’enregistrement : ' + err.message)
    });
  }
  

  createNormalTest(): void {
    const payload: TestDto = {
      test_name: 'Normal test',
      test_duration: '30s',
      number_of_agents: 2,
      source_id: 1,
      target_id: 2,
      profile_id: 1,
      threshold_id: 1,
      creation_date: new Date().toISOString(),
      test_type: 'scheduled_test',
      waiting: true,
      failed: false,
      completed: false
    };

    this.testService.createTest(payload).subscribe({
      next: () => console.log('✅ Test normal enregistré avec succès'),
      error: (err) => console.error('❌ Erreur lors de la création :', err)
    });
  }

  onSubmit(): void {
    console.log('Détails du test soumis :', this.testForm);
    this.launchQuickTest();
  }
}
