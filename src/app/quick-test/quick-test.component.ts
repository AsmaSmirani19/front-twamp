import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AgentService } from '../agent-list/agent.service';
import { TestProfileService } from '../test-profile/test-profile.service';
import { ThresholdService } from '../threshold/threshold.service';
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
  notification: string | null = null;

  testForm = {
    name: '',
    duration: null as number | null,
    nbTests: 1,
    agentSource: '',
    agentDestination: '',
    qosProfile: '',
    threshold: ''
  };

  constructor(
    private agentService: AgentService,
    private testProfileService: TestProfileService,
    private thresholdService: ThresholdService,
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
      next: data => this.agents = data,
      error: err => console.error("Erreur chargement agents :", err)
    });
  }

  loadTestProfiles(): void {
    this.testProfileService.getTestProfiles().subscribe({
      next: profiles => this.testProfiles = profiles,
      error: err => console.error("Erreur chargement profils :", err)
    });
  }

  loadThresholds(): void {
    this.thresholdService.getThresholds().subscribe({
      next: thresholds => this.thresholds = thresholds,
      error: err => console.error("Erreur chargement thresholds :", err)
    });
  }

  loadQuickTests(): void {
    this.testService.getTests().subscribe({
      next: tests => {
        this.quickTests = tests
          .filter(t => t.test_type === "quick_test")
          .map(t => ({ ...t, isPaused: false }));
      },
      error: err => console.error("Erreur chargement quick tests :", err)
    });
  }

 startTest(test: TestDto): void {
  if (!test.id || test.id === 0) {
    this.notification = "ID de test invalide, impossible de lancer le test.";
    return;
  }
  this.testService.triggerTest(test.id, test.test_type).subscribe({
    next: () => {
      this.notification = `Test "${test.test_name}" lancé avec succès !`;
      this.closeQuickTestPopup(); // fermer la popup après succès
      this.loadQuickTests();      // recharger la liste des tests
    },
    error: err => this.notification = `Erreur lors du lancement : ${err.message}`
  });
}


  launchQuickTest(): void {
    const { name, duration, agentSource, agentDestination, nbTests, qosProfile, threshold } = this.testForm;

    if (!name || name.trim() === '') {
      this.notification = "Le nom du test est requis";
      return;
    }
    if (duration === null || isNaN(duration) || duration <= 0) {
      this.notification = "La durée doit être un nombre supérieur à 0";
      return;
    }
    if (!agentSource || !agentDestination) {
      this.notification = "Les agents source et destination sont obligatoires";
      return;
    }
    console.log('agentDestination value:', agentDestination, 'typeof:', typeof agentDestination);
    const payload: TestDto = {
      test_name: name.trim(),
      test_duration: `${duration}s`,
      number_of_agents: nbTests,
      source_id: parseInt(agentSource, 10),
      target_id:Number.isNaN(parseInt(agentDestination, 10)) ? undefined : parseInt(agentDestination, 10),
      profile_id: qosProfile ? parseInt(qosProfile, 10) : undefined,
      threshold_id: threshold ? parseInt(threshold, 10) : undefined,
      creation_date: new Date().toISOString(),
      test_type: "quick_test",
      inProgress: true,
      failed: false,
      completed: false,
      error: false
    };
    console.log('Payload envoyé au backend :', payload);
    this.testService.createTest(payload).subscribe({
      next: (createdTest) => {
        const testId = createdTest?.id ?? createdTest?.data?.id;
        if (testId && testId > 0) {
          this.testService.triggerTest(testId, "quick_test").subscribe({
            next: () => {
              this.notification = 'Test lancé avec succès !';
              this.loadQuickTests();
              this.closeQuickTestPopup();
            },
            error: err => {
              console.error(err);
              this.notification = 'Erreur lors du lancement : ' + err.message;
            }
          });
        } else {
          this.notification = "ID du test créé invalide";
        }
      },
      error: err => {
        console.error(err);
        this.notification = 'Erreur lors de la création : ' + err.message;
      }
    });
  }

  onSubmit(form: NgForm): void {
  console.log('onSubmit called', form.valid, form.value);
  if (form.invalid) {
    this.notification = "Formulaire invalide";
    return;
  }
  this.launchQuickTest();
 }



  openQuickTestPopup(): void {
    this.showQuickPopup = true;
  }

  closeQuickTestPopup(): void {
    console.log('closeQuickTestPopup called');  
    this.showQuickPopup = false;
    this.notification = '';
    this.testForm = {
      name: '',
      duration: null,
      nbTests: 1,
      agentSource: '',
      agentDestination: '',
      qosProfile: '',
      threshold: ''
    };
  }

  formatDuration(duration: string): string {
    if (!duration || typeof duration !== 'string') return '-';
    const cleaned = duration.trim().replace(/[^0-9]/g, '');
    const seconds = parseInt(cleaned, 10);
    if (isNaN(seconds)) return '-';
    return seconds >= 60
      ? `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      : `${seconds}s`;
  }
}
