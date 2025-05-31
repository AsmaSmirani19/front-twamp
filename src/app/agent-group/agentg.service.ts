import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Agent {
  id?: number;
  name: string;
  address: string;
  port: number;
  availability: number;
  testHealth: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AgentServiceg {
  private ApiUrl = environment.ApiUrl; 
  private AgentLinkApiUrl = environment.AgentLinkApiUrl; 
  constructor(private http: HttpClient) {}

  // === Gestion des agents ===
  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.ApiUrl);
  }

  createAgent(agent: Agent): Observable<Agent> {
    return this.http.post<Agent>(this.ApiUrl, agent);
  }

  deleteAgent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ApiUrl}/${id}`);
  }

  // === Gestion des liens entre agents et groupes ===

// Récupérer les agents liés à un groupe (GET)
getAgentsByGroup(groupId: number): Observable<Agent[]> {
  const url = `${this.AgentLinkApiUrl}?group_id=${groupId}`;
  return this.http.get<Agent[]>(url);
}

// Lier plusieurs agents à un groupe (POST)
linkAgentsToGroup(data: { group_id: number; agent_ids: number[] }): Observable<any> {
  return this.http.post(this.AgentLinkApiUrl, data);
}

// Lier un seul agent à un groupe (en utilisant linkAgentsToGroup avec tableau à un élément)
addAgentToGroup(groupId: number, agentId: number): Observable<any> {
  return this.linkAgentsToGroup({ group_id: groupId, agent_ids: [agentId] });
}

// Supprimer un agent d'un groupe (DELETE)
removeAgentFromGroup(groupId: number, agentId: number): Observable<any> {
  return this.http.delete(`${this.AgentLinkApiUrl}?group_id=${groupId}&agent_id=${agentId}`);
}

  
}
