import { Component, OnInit } from '@angular/core';
import { AgentGroupService, AgentGroup } from '../agent-group/agent-group.service';
import { AgentService } from '../agent-list/agent.service';
import { TestProfile } from '../test-profile/test-profile.model';
import { TestProfileService } from '../test-profile/test-profile.service';
import { ThresholdService } from '../threshold/threshold.service';
import { TestService } from '../services/test.services';

export interface PlannedTest {
  id: number; // Ajout du champ id
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
  agents: any[] = [];
  thresholds: any[] = [];
  agentOptions: string[] = [];

  constructor(
    private testService: TestService,
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
    this.testService.getTests().subscribe({
      next: (testsFromAPI: any[]) => {
        if (Array.isArray(testsFromAPI)) {
          this.tableData.dataRows = testsFromAPI
            .filter(test => test.test_type === 'planned_test')
            .map(test => ({
              id: test.id,  // <-- ajout de l'id ici
              name: test.test_name,
              duration: test.test_duration,
              numberOfAgents: test.number_of_agents,
              createdAt: test.creation_date,
              isPaused: false,
              agentGroupId: test.agent_group_id,
              agentId: test.agent_id,
              testProfileId: test.test_profile_id,
              thresholdName: test.threshold_name
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
      },
      error: (error) => {
        console.error('Erreur lors du chargement des thresholds :', error);
      }
    });
  }

  updateAgentOptions(): void {
    this.agentOptions = this.agentGroups.map(group => group.group_name);
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
    const name = this.testPlan.name.trim();
    const durationStr = this.testPlan.duration.trim();

    if (!name || !durationStr) {
      console.error('❌ Le nom et la durée du test sont obligatoires.');
      return;
    }
    const durationNumber = parseInt(durationStr, 10);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      console.error('❌ La durée doit être un nombre valide supérieur à 0.');
      return;
    }
    let numberOfAgents = 1;
    let agentIdNumber: number | null = null;
    let agentGroupId: string | null = null;
    if (this.selectedAgentGroupId) {
      agentGroupId = this.selectedAgentGroupId;

      const agentsInGroup = this.agents.filter(agent => agent.group_id === agentGroupId);
      numberOfAgents = agentsInGroup.length;

      if (numberOfAgents === 0) {
        console.error('❌ Aucun agent trouvé dans le groupe sélectionné.');
        return;
      }

      agentIdNumber = agentsInGroup[0]?.id;
    } else if (this.selectedAgentId) {
      agentIdNumber = Number(this.selectedAgentId);
      numberOfAgents = 1;
    }

    if (!agentIdNumber || agentIdNumber <= 0) {
      console.error('❌ Agent ID manquant ou invalide.');
      return;
    }

    const profileId = this.selectedTestProfileId ? Number(this.selectedTestProfileId) : null;
    if (!profileId) {
      console.error('❌ Profil de test non sélectionné.');
      return;
    }
    const selectedThreshold = this.thresholds.find(t => t.name === this.selectedThreshold);
    const thresholdId = selectedThreshold ? selectedThreshold.id : 0;
    const newTest = {
      test_name: name,
      test_duration: `${durationNumber}s`,
      number_of_agents: numberOfAgents,
      creation_date: new Date().toISOString(),
      agent_group_id: agentGroupId,
      agent_id: agentIdNumber,
      test_profile_id: profileId,
      threshold_name: this.selectedThreshold,
      threshold_id: thresholdId,
      waiting: true,
      failed: false,
      completed: false,
      test_type: 'planned_test',
      source_id: agentIdNumber,
      target_id: agentIdNumber,
      profile_id: profileId,
      result_path: '/results/path',
      test_status: 'planned',
      is_periodic: false,
      interval: 0
    };

    console.log('✅ Payload envoyé au backend :', newTest);

    this.testService.createTest(newTest).subscribe({
      next: () => {
        console.log('✅ Test créé avec succès.');
        this.refreshPlannedTests();
        this.cancelWizard();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création du test :', err);
      }
    });
  }

  // lancer un test en utilisant l'id direct
  triggerTestFromUI(test: PlannedTest): void {
    console.log('🟡 triggerTestFromUI appelé avec test:', test); // <- ici
  
    if (!test || !test.id) {
      console.error('Test invalide pour déclenchement.');
      return;
    }
  
    this.testService.triggerTest(test.id).subscribe({
      next: () => {
        console.log(`✅ Test déclenché avec succès (ID: ${test.id})`);
      },
      error: (err) => {
        console.error('❌ Erreur lors du déclenchement du test :', err);
      }
    });
  }
  

  submitWizard(): void {
    if (!this.selectedAgentId) {
      console.error('Veuillez sélectionner un agent avant de soumettre.');
      return;
    }
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

  trackByTestId(index: number, test: PlannedTest): number {
    return test.id;
  }
}
