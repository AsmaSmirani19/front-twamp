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
  quickTests: TestDto[] = [];
  showQuickPopup = false;

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
          .filter(t => t.test_type === "quick_test")
          .map(t => ({ ...t, isPaused: false })); // Ajout isPaused localement
      },
      error: (err) => console.error('❌ Erreur quick tests :', err)
    });
  }

  formatDuration(duration: string): string {
    if (!duration) return 'Non défini';
    return duration.replace('s', ' sec');
  }

  startTest(test: TestDto): void {
  this.testService.triggerTest(test.id, test.test_type).subscribe({
    next: () => alert(`🚀 Test "${test.test_name}" lancé avec succès !`),
    error: (err) => alert(`❌ Erreur lors du lancement du test : ${err.message}`)
  });
}

 toggleControl(test: TestDto & { isPaused?: boolean }): void {
  test.isPaused = !test.isPaused;
  console.log(`Test "${test.test_name}" ${test.isPaused ? 'en pause' : 'repris'}`);
  // this.testService.togglePause(test.id, test.isPaused).subscribe(...) (à implémenter côté backend)
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

  openQuickTestPopup(): void {
    this.showQuickPopup = true;
  }

  closeQuickTestPopup(): void {
    this.showQuickPopup = false;
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
      test_type: "quick_test",
      inProgress: true,
      failed: false,
      completed: false,
      error: false
    };

    this.testService.createTest(payload).subscribe({
      next: (createdTest) => {
        alert('✅ Test enregistré avec succès dans la base de données');
        // Lancer le test immédiatement après création
        this.testService.triggerTest(createdTest.id, "quick_test").subscribe({
          next: () => {
            alert('🚀 Test lancé avec succès !');
            this.closeQuickTestPopup();
            this.loadQuickTests();
          },
          error: (err) => {
            alert('❌ Erreur lors du lancement du test : ' + err.message);
          }
        });
      },
      error: (err) => alert('❌ Erreur lors de l’enregistrement : ' + err.message)
    });
  }

  onSubmit(form: any): void {
    if (form.invalid) return;
    console.log('Détails du test soumis :', this.testForm);
    this.launchQuickTest();
  }

}
