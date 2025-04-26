import { Component, OnInit } from '@angular/core';
import { PlannedTestService } from './planned-test.service';  // Assurez-vous que le chemin est correct

export interface PlannedTest {
  name: string;
  duration: string;
  numberOfAgents: number;
  createdAt: string;
  isPaused: boolean;
}

@Component({
  selector: 'app-planned-test',
  templateUrl: './planned-test.component.html',
  styleUrls: ['./planned-test.component.scss']
})

export class PlannedTestComponent implements OnInit {
  tableData: { 
    headerRow: string[];
    dataRows: PlannedTest[];
  } = { 
    headerRow: ['Control', 'Test Name', 'Test Duration', 'Number of Agents', 'Creation Date', 'Action'],
    dataRows: []
  };

  selectedTest: PlannedTest | null = null;
  showWizard = false;
  wizardStep = 1;
  testPlan: { name: string; duration: string; } = { name: '', duration: '' };

  // Injection du service dans le constructeur
  constructor(private plannedTestService: PlannedTestService) {}

  ngOnInit(): void {
    this.plannedTestService.getPlannedTests().subscribe({
      next: (testsFromAPI: any[]) => {
        if (Array.isArray(testsFromAPI)) {
          this.tableData.dataRows = testsFromAPI.map(test => ({
            name: test.test_name,
            duration: test.test_duration,
            numberOfAgents: test.number_of_agents,
            createdAt: test.creation_date,
            isPaused: false  // valeur par défaut car elle n'est pas envoyée par l'API
          }));
          console.log('headerRow:', this.tableData.headerRow); // Log pour vérifier l'ordre
          console.log('dataRows:', this.tableData.dataRows); // Log pour vérifier les données
        } else {
          console.error('Données invalides reçues');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des tests :', err);
      }
    });
  }
  

  onNewPlannedTest(): void {
    this.showWizard = true;
    this.wizardStep = 1;
    this.testPlan = { name: '', duration: '' };
  }

  nextStep(): void {
    if (this.wizardStep < 3) this.wizardStep++;
  }

  prevStep(): void {
    if (this.wizardStep > 1) this.wizardStep--;
  }

  cancelWizard(): void {
    this.showWizard = false;
    this.testPlan = { name: '', duration: '' };
  }

  createAndAddTest(): void {
    if (!this.testPlan.name.trim() || !this.testPlan.duration.trim()) {
      console.error('Le nom et la durée du test sont obligatoires.');
      return;
    }
  
    const durationNumber = parseInt(this.testPlan.duration.trim(), 10);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      console.error('La durée doit être un nombre valide et supérieur à zéro.');
      return;
    }
  
    // ✅ Crée un objet compatible avec la struct Go
    const goCompatibleTest = {
      test_name: this.testPlan.name.trim(),
      test_duration: this.testPlan.duration.trim() + 's', // Par exemple "60s"
      number_of_agents: 0,
      creation_date: new Date().toISOString()
    };
  
    // Envoie l'objet vers l'API
    this.plannedTestService.createPlannedTest(goCompatibleTest as any).subscribe({
      next: (createdTest) => {
        console.log('Test créé avec succès:', JSON.stringify(createdTest, null, 2));
        this.tableData.dataRows.push(createdTest);
        this.cancelWizard();
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement du test :', err);
      }
    });
  }
  
  submitWizard(): void {
    this.createAndAddTest();
  }

  finishWizard(): void {
    this.createAndAddTest();
  }

  onView(row: PlannedTest): void {
    this.selectedTest = row;
  }

  closePopup(): void {
    this.selectedTest = null;
  }

  onDelete(row: PlannedTest): void {
    const index = this.tableData.dataRows.findIndex(test => test === row);
    if (index !== -1) {
      this.tableData.dataRows.splice(index, 1);
    } else {
      console.error('Test non trouvé pour suppression');
    }
  }

  toggleControl(test: PlannedTest): void {
    test.isPaused = !test.isPaused;
  }

  trackByTestId(index: number, test: PlannedTest): string {
    return test.createdAt;  // Utiliser un identifiant unique
  }

  sourceType: 'group' | 'single' = 'group';
  agentOptions: string[] = ['Agent 1', 'Agent 2', 'Group A', 'Group B'];
  targetOptions: string[] = ['Target A', 'Target B', 'Server 1', 'Server 2'];
  qosProfiles: string[] = ['Default Profile', 'High Sensitivity', 'Low Latency', 'Custom Profile'];
}
