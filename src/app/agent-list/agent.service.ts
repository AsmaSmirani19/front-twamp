import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
// Définition du type Agent
export interface Agent {
  id?: number;
  name: string;
  address: string;
  port: number; 
  testHealth: boolean;
  availability: number;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  // Utilisation de la variable d'environnement pour l'URL de l'API
  private ApiUrl = environment.ApiUrl;
  constructor(private http: HttpClient) {}

  // Fonction pour récupérer la liste des agents
  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(this.ApiUrl);
  }

  // Fonction pour créer un nouvel agent
  createAgent(agent: Agent): Observable<Agent> {
    return this.http.post<Agent>(this.ApiUrl, agent);
  }

  // Fonction pour supprimer un agent
  deleteAgent(id: number): Observable<any> {
    return this.http.delete(`${this.ApiUrl}/${id}`);
  }
    
}
