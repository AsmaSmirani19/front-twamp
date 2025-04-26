import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError , map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export interface AgentGroup {
  id?: number;
  group_name: string;
  number_of_agents: number;
  creation_date: string;
  agents?: any[];
}

@Injectable({
  providedIn: 'root'  // Le service est injecté dans toute l'application
})
export class AgentGroupService {
  private GroupsApiUrl = environment.GroupsApiUrl;

  constructor(private http: HttpClient) {}

  getAgentGroups(): Observable<AgentGroup[]> {
    return this.http.get<AgentGroup[]>(this.GroupsApiUrl).pipe(
      map(groups => {
        return groups.map(group => ({
          ...group,
          agents: group.agents || [], // Force un tableau vide si null
          number_of_agents: (group.agents || []).length // Calcul réel
        }));
      }),
      catchError(err => {
        console.error('Erreur API:', err);
        return throwError(() => err);
      })
    );
  }

  createAgentGroup(group: any): Observable<AgentGroup> {
    return this.http.post<AgentGroup>(this.GroupsApiUrl, group).pipe(
      catchError((err) => {
        console.error('Erreur lors de l\'appel à l\'API pour créer le groupe:', err);
        return throwError(() => err);
      })
    );
  }
  
  
  deleteAgentGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.GroupsApiUrl}?id=${id}`).pipe(
      catchError((err) => {
        console.error('Erreur lors de la suppression du groupe:', err);
        return throwError(() => err);  // Propagation de l'erreur
      })
    );
  }
  
}
