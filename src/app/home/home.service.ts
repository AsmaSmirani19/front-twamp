import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface pour les statuts agents (à adapter selon ta réponse API)
export interface AgentStatus {
  id: number;
  name: string;
  status: 'active' | 'inactive' | string;
  test_health: boolean; 
  // autres champs si besoin
}

export interface TestStats {
  total: number;
  success: number;
  failed: number;
  tests_by_type: TestTypeStat[];
}

export interface TestTypeStat {
  test_type: string;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class TestService {
  private testStatsApiUrl = environment.testStatsApiUrl;
  private agentStatusApiUrl = environment.agentStatusApiUrl;  // <== correction ici

  constructor(private http: HttpClient) {}

  getTestStats(): Observable<TestStats> {
    return this.http.get<TestStats>(this.testStatsApiUrl);
  }
  
  getAgentStatuses(): Observable<AgentStatus[]> {
    return this.http.get<AgentStatus[]>(this.agentStatusApiUrl);  // utiliser la bonne variable
  }
}
