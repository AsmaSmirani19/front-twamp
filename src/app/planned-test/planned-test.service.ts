import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlannedTest {
  name: string;
  duration: string;
  numberOfAgents: number;
  createdAt: string;
  isPaused: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlannedTestService {
  private plannedTestsApiUrl = environment.plannedTestsApiUrl; // Utiliser plannedTestsApiUrl directement
  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les tests planifiés depuis l'API
  getPlannedTests(): Observable<PlannedTest[]> {
    return this.http.get<PlannedTest[]>(this.plannedTestsApiUrl); // Utilisation de plannedTestsApiUrl
  }

  // Méthode pour créer un nouveau test planifié
  createPlannedTest(test: PlannedTest): Observable<PlannedTest> {
    return this.http.post<PlannedTest>(this.plannedTestsApiUrl, test); // Utilisation de plannedTestsApiUrl
  }

  // Méthode pour ajouter un agent
  addAgent(agentData: any): Observable<any> {
    return this.http.post(this.plannedTestsApiUrl, agentData); // Utilisation de plannedTestsApiUrl
  }
}
