import { Component, OnInit } from '@angular/core';
import { AgentGroupService, AgentGroup } from '../agent-group/agent-group.service';
import { AgentService } from '../agent-list/agent.service';
import { AgentServiceg } from '../agent-group/agentg.service';
import { TestProfile } from '../test-profile/test-profile.model';
import { TestProfileService } from '../test-profile/test-profile.service';
import { ThresholdService } from '../threshold/threshold.service';
import { TestService } from '../services/test.services';
import { Agent } from '../agent-group/agentg.service';

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
  selectedTargetAgentId: number | null = null;


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
    private thresholdService: ThresholdService,
    private agentServiceg: AgentServiceg
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

agentsInSelectedGroup: Agent[] = [];  // nouvelle propriété pour stocker les agents du groupe

onAgentGroupChange(): void {
  if (this.selectedAgentGroupId) {
    const groupIdNumber = Number(this.selectedAgentGroupId);
    this.agentServiceg.getAgentsByGroup(groupIdNumber).subscribe({
      next: (agents) => {
        this.agentsInSelectedGroup = agents;
        console.log('Agents récupérés pour le groupe:', agents);
      },
      error: (err) => {
        console.error('Erreur récupération agents groupe:', err);
        this.agentsInSelectedGroup = [];
      }
    });
  } else {
    this.agentsInSelectedGroup = [];
  }
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

  const profileId = this.selectedTestProfileId ? Number(this.selectedTestProfileId) : null;
  if (!profileId) {
    console.error('❌ Profil de test non sélectionné.');
    return;
  }

  const selectedThreshold = this.thresholds.find(t => t.name === this.selectedThreshold);
  const thresholdId = selectedThreshold ? selectedThreshold.id : 0;

  const sourceIdNumber = Number(this.selectedAgentId);

  if (isNaN(sourceIdNumber) || sourceIdNumber <= 0) {
    console.error('❌ ID agent source invalide.');
    return;
  }

  // === CAS AGENT x GROUPE ===
  if (this.selectedAgentGroupId) {
    const groupIdNumber = Number(this.selectedAgentGroupId);

    this.agentServiceg.getAgentsByGroup(groupIdNumber).subscribe({
      next: (agentsInGroup) => {
        if (!agentsInGroup || agentsInGroup.length === 0) {
          console.error('❌ Aucun agent trouvé dans le groupe sélectionné.');
          return;
        }

        // Source doit être un agent individuel (pas dans le groupe obligatoire)
        const targetIds = agentsInGroup
          .filter(agent => agent.id !== sourceIdNumber) // Exclure le source si besoin
          .map(agent => agent.id);

        if (targetIds.length === 0) {
          console.error('❌ Aucun agent cible valide dans le groupe.');
          return;
        }

        const newTest = {
          test_name: name,
          test_duration: `${durationNumber}s`,
          number_of_agents: targetIds.length,
          creation_date: new Date().toISOString(),
          agent_group_id: groupIdNumber,
          agent_id: sourceIdNumber,
          test_profile_id: profileId,
          threshold_name: this.selectedThreshold,
          threshold_id: thresholdId,
          inProgress: true,
          failed: false,
          completed: false,
          error: false,
          test_type: 'planned_test' as 'planned_test',
          source_id: sourceIdNumber,
          target_ids: targetIds,
          profile_id: profileId,
          result_path: '/results/path',
          test_status: 'planned',
          is_periodic: false,
          interval: 0
        };

        console.log('✅ Payload (agent x groupe) :', newTest);

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
      },
      error: (err) => {
        console.error('❌ Erreur lors de la récupération des agents du groupe :', err);
      }
    });

  // === CAS AGENT x AGENT ===
} else {
  const targetIdNumber = Number(this.selectedTargetAgentId);

  if (isNaN(targetIdNumber) || targetIdNumber <= 0) {
    console.error('❌ ID agent cible invalide ou non sélectionné.');
    return;
  }

  const newTest = {
    test_name: name,
    test_duration: `${durationNumber}s`,
    number_of_agents: 1,
    creation_date: new Date().toISOString(),
    agent_group_id: null,
    agent_id: sourceIdNumber,
    test_profile_id: profileId,
    threshold_name: this.selectedThreshold,
    threshold_id: thresholdId,
    inProgress: true,
    failed: false,
    completed: false,
    error: false,
    test_type: 'planned_test' as 'planned_test',
    source_id: sourceIdNumber,
    target_ids: [targetIdNumber],
    profile_id: profileId,
    result_path: '/results/path',
    test_status: 'planned',
    is_periodic: false,
    interval: 0
  };

  console.log('✅ Payload (agent x agent) :', newTest);

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
}


triggerTestFromUI(test: PlannedTest): void {
  console.log('🟡 triggerTestFromUI appelé avec test:', test);

  if (!test || !test.id) {
    console.error('Test invalide pour déclenchement.');
    return;
  }

  // Cas Agent x Groupe
  if (test.agentGroupId) {
    console.log('🔍 agentGroupId:', test.agentGroupId);
    const groupId = Number(test.agentGroupId);
    this.agentServiceg.getAgentsByGroup(groupId).subscribe({
      next: (agentsInGroup: Agent[]) => {
        const targetIds = agentsInGroup
          .filter(agent => agent.id !== test.agentId)
          .map(agent => agent.id);

        if (targetIds.length === 0) {
          console.error('❌ Aucun agent cible valide dans le groupe.');
          return;
        }

        console.log('📤 Déclenchement Agent x Groupe avec target_ids:', targetIds);
        console.log('🎯 targetIds calculés:', targetIds);

        const payload = {
          test_id: test.id,
          test_type: 'planned_test',
          target_ids: targetIds
        };

        console.log('📤 Payload final envoyé au backend:', payload);

        this.testService.triggerTest(test.id, 'planned_test', targetIds).subscribe({
          next: () => {
            console.log(`✅ Test Agent x Groupe déclenché avec succès (ID: ${test.id})`);
          },
          error: (err) => {
            console.error('❌ Erreur déclenchement (Agent x Groupe):', err);
          }
        });
      },
      error: (err) => {
        console.error('❌ Erreur récupération agents du groupe:', err);
      }
    });

  } else {
    // Cas Agent x Agent (pas de target_ids à envoyer)
    this.testService.triggerTest(test.id, 'planned_test').subscribe({
      next: () => {
        console.log(`✅ Test Agent x Agent déclenché avec succès (ID: ${test.id})`);
      },
      error: (err) => {
        console.error('❌ Erreur déclenchement (Agent x Agent):', err);
      }
    });
  }
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