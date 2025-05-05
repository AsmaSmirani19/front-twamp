import { Component, OnInit } from '@angular/core';
import { PlannedTestService } from './planned-test.service';
import { AgentGroupService, AgentGroup } from '../agent-group/agent-group.service';
import { AgentService } from '../agent-list/agent.service'; 
import { TestProfile } from '../test-profile/test-profile.model'; 
import { TestProfileService } from '../test-profile/test-profile.service'; 
import { ThresholdService } from '../threshold/threshold.service';


export interface PlannedTest {
  name: string;
  duration: string;
  numberOfAgents: number;
  createdAt: string;
  isPaused: boolean;
  agentGroupId?: string; 
  agentId?: string;
  testProfileId?: number;
  thresholdName?: string;
}

@Component({
  selector: 'app-planned-test',
  templateUrl: './planned-test.component.html',
  styleUrls: ['./planned-test.component.scss']
})
export class PlannedTestComponent implements OnInit {
  tableData = {
    headerRow: ['Control', 'Test Name', 'Test Duration', 'Number of Agents', 'Creation Date', 'Action'],
    dataRows: [] as PlannedTest[]
  };

  selectedTest: PlannedTest | null = null;
  showWizard = false;
  wizardStep = 1;

  testPlan = { name: '', duration: '' };
  selectedAgentGroupId: string | null = null;
  selectedAgentId: string | null = null;
  selectedTestProfileId: number | null = null;
  selectedThreshold: string | null = null;

  qosProfiles: TestProfile[] = [];
  agentGroups: AgentGroup[] = [];
  agentOptions: string[] = [];
  agents: any[] = [];
  thresholds: any[] = []; 

  constructor(
    private plannedTestService: PlannedTestService,
    private agentGroupService: AgentGroupService,
    private agentService: AgentService,
    private testProfileService: TestProfileService,
    private thresholdService: ThresholdService
  ) {}

  ngOnInit(): void {
    this.refreshPlannedTests();
    this.loadAgentGroups();
    this.loadAgents();
    this.loadTestProfiles();
    this.loadThresholds();
    
  }

  refreshPlannedTests(): void {
    this.plannedTestService.getPlannedTests().subscribe({
      next: (testsFromAPI: any[]) => {
        if (Array.isArray(testsFromAPI)) {
          this.tableData.dataRows = testsFromAPI.map(test => ({
            name: test.test_name,
            duration: test.test_duration,
            numberOfAgents: test.number_of_agents,
            createdAt: test.creation_date,
            isPaused: false
          }));
        } else {
          console.error('Données invalides reçues');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des tests :', err);
      }
    });
  }

  loadAgentGroups(): void {
    this.agentGroupService.getAgentGroups().subscribe({
      next: (groups: AgentGroup[]) => {
        console.log('Groupes d\'agents récupérés:', groups);
        this.agentGroups = groups;
        this.updateAgentOptions();
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des groupes d\'agents :', err);
      }
    });
  }


  loadAgents(): void {
    this.agentService.getAgents().subscribe({
      next: (agents) => {
        console.log('Agents récupérés:', agents);
        this.agents = agents;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des agents :', err);
      }
    });
  }

  loadTestProfiles(): void {
    this.testProfileService.getTestProfiles().subscribe({
      next: (profiles: TestProfile[]) => {
        this.qosProfiles = profiles;
        console.log('QoS Profiles loaded:', profiles);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des profils QoS :', error);
      }
    });
  }

  loadThresholds(): void {
    this.thresholdService.getThresholds().subscribe({
      next: (thresholds: any[]) => {
        this.thresholds = thresholds;
        console.log('Thresholds loaded:', thresholds); 
      },
      error: (error) => {
        console.error('Erreur lors du chargement des thresholds :', error);
      }
    });
  }
  

  updateAgentOptions(): void {
    if (Array.isArray(this.agentGroups)) {
      this.agentOptions = this.agentGroups.map(group => group.group_name);
      console.log('Options d\'agents mises à jour:', this.agentOptions);
    }
  }

  onNewPlannedTest(): void {
    this.showWizard = true;
    this.wizardStep = 1;
    this.resetTestPlan();
  }

  resetTestPlan(): void {
    this.testPlan = { name: '', duration: '' };
    this.selectedAgentGroupId = null;
    this.selectedAgentId = null;
    this.selectedTestProfileId = null;
    this.selectedThreshold = null; 
  }

  nextStep(): void {
    if (this.wizardStep < 3) this.wizardStep++;
  }

  prevStep(): void {
    if (this.wizardStep > 1) this.wizardStep--;
  }

  cancelWizard(): void {
    this.showWizard = false;
    this.resetTestPlan();
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

    const newTest = {
      test_name: this.testPlan.name.trim(),
      test_duration: this.testPlan.duration.trim() + 's',
      number_of_agents: 0,
      creation_date: new Date().toISOString(),
      agent_group_id: this.selectedAgentGroupId,
      agent_id: this.selectedAgentId,
      test_profile_id: this.selectedTestProfileId,
      threshold_name: this.selectedThreshold
    };

    this.plannedTestService.createPlannedTest(newTest as any).subscribe({
      next: () => {
        console.log('Test créé avec succès');
        this.refreshPlannedTests();
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
    return test.createdAt;
  }
}
