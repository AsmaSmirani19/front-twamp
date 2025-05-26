import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';  // Import de l'environnement

@Injectable({
  providedIn: 'root'
})
export class ThresholdService {
  private thresholdApiUrl = environment.thresholdApiUrl;  
  

  constructor(private http: HttpClient) {}

  // Récupérer la liste des thresholds
  getThresholds(): Observable<any> {
    return this.http.get<any[]>(`${this.thresholdApiUrl}`);  
  }

  // Créer un nouveau threshold
  createThreshold(threshold: any): Observable<any> {
    return this.http.post<any>(`${this.thresholdApiUrl}`, threshold); 
  }

  // Mettre à jour un threshold existant
  updateThreshold(threshold: any): Observable<any> {
    return this.http.put<any>(`${this.thresholdApiUrl}`, threshold);  
  }

  // Supprimer un threshold
  deleteThreshold(thresholdId: number): Observable<any> {
    return this.http.delete<any>(`${this.thresholdApiUrl}?id=${thresholdId}`);  
  }
}
