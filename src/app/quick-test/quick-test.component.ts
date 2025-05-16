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
  quickTests: any[] = [];
  showQuickPopup: boolean = false;

  testForm = {
    name: '',
    duration: 0,
    nbTests: 0,
    agentSource: '',
    agentDestination: '',
    qosProfile: '',
    threshold: ''
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
    this.loadQuickTests();
  }

  loadAgents(): void {
    this.agentService.getAgents().subscribe({
      next: (data) => {
        this.agents = data;
        console.log("✅ Agents chargés :", this.agents);
      },
      error: (err) => console.error("❌ Erreur agents :", err)
    });
  }

  loadTestProfiles(): void {
    this.testProfileService.getTestProfiles().subscribe({
      next: (profiles) => {
        this.testProfiles = profiles;
        console.log("✅ Profils chargés :", this.testProfiles);
      },
      error: (err) => console.error('❌ Erreur profils :', err)
    });
  }

  getThresholdName(id: number): string {
    const t = this.thresholds.find(th => th.id === id);
    return t ? t.name : 'Seuil inconnu';
  }

  loadThresholds(): void {
    this.thresholdService.getThresholds().subscribe({
      next: (thresholds) => {
        this.thresholds = thresholds;
        console.log("✅ Thresholds chargés :", this.thresholds);
      },
      error: (err) => console.error('❌ Erreur thresholds :', err)
    });
  }

  loadQuickTests(): void {
    this.testService.getTests().subscribe({
      next: (tests) => {
        this.quickTests = tests
          .filter(t => t.test_type === 'quick_test')
          .map(t => ({ ...t, isPaused: false })); // Ajoute `isPaused` à chaque test
      },
      error: (err) => console.error('❌ Erreur quick tests :', err)
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
    if (!duration) return 'Non défini';
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
        this.loadQuickTests();
      },
      error: (err) => alert('❌ Erreur lors de l’enregistrement : ' + err.message)
    });
  }

  onDeleteTest(testId: number): void {
    this.testService.deleteTest(testId).subscribe({
      next: () => {
        console.log('✅ Test supprimé avec succès.');
        this.loadQuickTests();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la suppression du test :', err);
      }
    });
  }

  toggleControl(test: any): void {
    test.isPaused = !test.isPaused;
    console.log(`Test "${test.test_name}" ${test.isPaused ? 'en pause' : 'repris'}`);
    // Tu peux ici envoyer une requête backend si tu veux vraiment "pauser" le test
  }

  onSubmit(form: any): void {
    if (form.invalid) return;
    console.log('Détails du test soumis :', this.testForm);
    this.launchQuickTest();
  }
}
