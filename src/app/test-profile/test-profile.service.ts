import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TestProfile } from './test-profile.model';

@Injectable({
  providedIn: 'root',
})
export class TestProfileService {
  private readonly apiUrl = environment.testProfileApiUrl;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les profils de test
   */
  getTestProfiles(): Observable<TestProfile[]> {
    return this.http.get<TestProfile[]>(this.apiUrl, this.httpOptions).pipe(
      map(profiles => (profiles || []).filter(p => p.profile_name?.trim())),
      catchError(this.handleError)
    );
  }

  /**
   * Crée un nouveau profil de test
   */
  createTestProfile(testProfile: Omit<TestProfile, 'id'>): Observable<TestProfile> {
    return this.http.post<TestProfile>(
      this.apiUrl,
      testProfile,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour un profil existant
   */
  updateTestProfile(testProfile: TestProfile): Observable<TestProfile> {
    if (!testProfile.id) {
      return throwError(() => new Error('ID du profil requis pour la mise à jour'));
    }

    return this.http.put<TestProfile>(
      `${this.apiUrl}/${testProfile.id}`,
      testProfile,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprime un profil
   */
  deleteTestProfile(id: number): Observable<void> {
    if (!id) {
      return throwError(() => new Error('ID du profil requis pour la suppression'));
    }

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Erreur dans TestProfileService:', error);

    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur (${error.status}): ${error.message}`;
      if (error.error?.message) {
        errorMessage += ` - Détails: ${error.error.message}`;
      } else if (error.error?.error) {
        errorMessage += ` - Détails: ${error.error.error}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
