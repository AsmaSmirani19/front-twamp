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
export class AgentService {
  private ApiUrl = environment.ApiUrl; // Par exemple: http://localhost:3000/agents

  constructor(private http: HttpClient) {}

  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.ApiUrl);
  }

  createAgent(agent: Agent): Observable<Agent> {
    return this.http.post<Agent>(this.ApiUrl, agent);
  }

  deleteAgent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ApiUrl}/${id}`);
  }
}
