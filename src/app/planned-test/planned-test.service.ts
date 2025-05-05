import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface pour un test planifié
export interface PlannedTest {
  name: string;
  duration: string;
  numberOfAgents: number;
  createdAt: string;
  isPaused: boolean;
}

// Interface pour un agent
export interface Agent {
  id: number;
  name: string;
}

// Interface pour un groupe d'agents
export interface AgentGroup {
  groupName: string;
  agents: Agent[];
}

@Injectable({
  providedIn: 'root'
})
export class PlannedTestService {
  private plannedTestsApiUrl = environment.plannedTestsApiUrl; // URL des tests planifiés
  private agentGroupsApiUrl = environment.GroupsApiUrl; // URL des groupes d'agents

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les tests planifiés depuis l'API
  getPlannedTests(): Observable<PlannedTest[]> {
    return this.http.get<PlannedTest[]>(this.plannedTestsApiUrl); // Utilisation de plannedTestsApiUrl
  }

  // Méthode pour créer un nouveau test planifié
  createPlannedTest(test: PlannedTest): Observable<PlannedTest> {
    return this.http.post<PlannedTest>(this.plannedTestsApiUrl, test); // Utilisation de plannedTestsApiUrl
  }

  // Méthode pour récupérer les groupes d'agents
 // agent-group.service.ts
  getAgentGroups(): Observable<AgentGroup[]> {
    return this.http.get<AgentGroup[]>('http://localhost:5000/api/agent-group');
}


  // Méthode pour ajouter un agent à un test planifié (si nécessaire)
  addAgentToPlannedTest(agentData: any): Observable<any> {
    return this.http.post(this.plannedTestsApiUrl, agentData); // Utilisation de plannedTestsApiUrl
  }
}
