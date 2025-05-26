import { Component, OnInit } from '@angular/core';
import { AgentGroupService, AgentGroup } from '../agent-group/agent-group.service';
import { AgentService } from '../agent-list/agent.service';
import { TestProfile } from '../test-profile/test-profile.model';
import { TestProfileService } from '../test-profile/test-profile.service';
import { ThresholdService } from '../threshold/threshold.service';
import { TestService } from '../services/test.services';
import { PlannedTestService, PlannedTestInfo } from './planned-test.service';

export interface PlannedTest {
  id: number;
  name: string;
  duration: string;
  numberOfAgents: number;
  createdAt: string;
  isPaused: boolean;
  agentGroupId?: string;
  agentId?: number;
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
  selectedAgentId: number | null = null;
  selectedTestProfileId: number | null = null;
  selectedThreshold: string | null = null;

  qosProfiles: TestProfile[] = [];
  agentGroups: AgentGroup[] = [];
  agents: any[] = [];
  thresholds: any[] = [];
  agentOptions: string[] = [];

  constructor(
    private testService: TestService,
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
    this.testService.getTests().subscribe({
      next: (testsFromAPI: any[]) => {
        if (Array.isArray(testsFromAPI)) {
          this.tableData.dataRows = testsFromAPI
            .filter(test => test.test_type === 'planned_test')
            .map(test => ({
              id: test.id,
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
    let agentGroupId: string | null = null;
    let sourceId: number | null = null;
    let targetId: number | null = null;

    if (this.selectedAgentGroupId) {
      agentGroupId = this.selectedAgentGroupId;

      const agentsInGroup = this.agents.filter(agent => agent.group_id === agentGroupId);
      numberOfAgents = agentsInGroup.length;

      if (numberOfAgents === 0) {
        console.error('❌ Aucun agent trouvé dans le groupe sélectionné.');
        return;
      }

      // source = premier agent
      sourceId = agentsInGroup[0]?.id;

      // target = deuxième agent si existant sinon null
      targetId = agentsInGroup.length > 1 ? agentsInGroup[1].id : null;

    } else if (this.selectedAgentId) {
      const agentIdNumber = Number(this.selectedAgentId);
      numberOfAgents = 1;

      sourceId = agentIdNumber;

      // Recherche un autre agent pour target (différent de source)
      const otherAgent = this.agents.find(agent => agent.id !== sourceId);
      targetId = otherAgent ? otherAgent.id : sourceId;  // Si pas d'autre agent, target = source
    }

    if (!sourceId) {
      console.error('❌ Source ID agent manquant ou invalide.');
      return;
    }

    // Si targetId est null ou 0, on le force à sourceId
    if (!targetId || targetId === 0) {
      console.warn('⚠️ Target ID non défini ou invalide, on met la source comme cible par défaut.');
      targetId = sourceId;
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
      agent_id: sourceId,
      test_profile_id: profileId,
      threshold_name: this.selectedThreshold,
      threshold_id: thresholdId,
      inProgress: true,
      failed: false,
      completed: false,
      error : false,
      test_type: 'planned_test' as 'planned_test',
      source_id: sourceId,
      target_id: targetId,
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

  triggerTestFromUI(test: PlannedTest): void {
    console.log('🟡 triggerTestFromUI appelé avec test:', test);

    if (!test || !test.id) {
      console.error('Test invalide pour déclenchement.');
      return;
    }

    this.testService.triggerTest(test.id, 'planned_test').subscribe({
      next: () => {
        console.log(`✅ Test déclenché avec succès (ID: ${test.id}, Type: planned_test)`);
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

  selectedDetailedTest: PlannedTestInfo | null = null;

  onView(row: PlannedTest): void {
    console.log('Test sélectionné :', row);  // 👈 vérifie ici l'id

    this.selectedTest = row;
    this.selectedDetailedTest = null;

    this.plannedTestService.getPlannedTestById(row.id).subscribe({
      next: (data: PlannedTestInfo) => {
        this.selectedDetailedTest = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des détails du test :', err);
      }
    });
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
