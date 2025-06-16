import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestResult } from './test-result.model';
import { environment } from '../../environments/environment';
import { AttemptResult } from './test-result.model';
import { QoSMetrics } from './test-result.model';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';




@Injectable({
  providedIn: 'root'
})

export class TestService {

  private apiUrl = environment.testResultsApiUrl; // ex: 'http://localhost:5000/api/tests'

  constructor(private http: HttpClient) {}

  getTestResults(): Observable<TestResult[]> {
    console.log('📡 Appel API : récupération de tous les tests');
    return this.http.get<TestResult[]>(this.apiUrl).pipe(
      tap((results) => {
        console.log('✅ Réponse reçue pour tous les tests :', results);
      }),
      catchError(error => {
        console.error('❌ Erreur lors de la récupération des tests :', error);
        return throwError(error);
      })
    );
  }

  getTestResultDetails(id: number): Observable<TestResult> {
    console.log(`📦 Appel API: récupération du test avec ID = ${id}`);
    return this.http.get<TestResult>(`${this.apiUrl}/${id}`).pipe(
      tap((result) => {
        console.log('✅ Détail du test reçu :', result);
      }),
      catchError(error => {
        console.error(`❌ Erreur lors de la récupération du test ID ${id} :`, error);
        return throwError(error);
      })
    );
  }

  deleteTestResult(id: number): Observable<any> {
    console.log(`🗑 Suppression du test ID = ${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log(`✅ Test ID ${id} supprimé`);
      }),
      catchError(error => {
        console.error(`❌ Erreur lors de la suppression du test ID ${id} :`, error);
        return throwError(error);
      })
    );
  }

  getAttemptResults(testId: number, targetId: number): Observable<AttemptResult[]> {
    const url = environment.testResultsByIdApiUrl;
    const params = new HttpParams()
      .set('id', testId.toString())
      .set('target_id', targetId.toString());

    console.log(`📡 Appel API : récupération des résultats de tentative pour testId=${testId}, targetId=${targetId}`);
    return this.http.get<AttemptResult[]>(url, { params }).pipe(
      tap((data) => {
        console.log(`✅ Tentatives reçues pour testId=${testId}, targetId=${targetId} :`, data);
      }),
      catchError(error => {
        console.error(`❌ Erreur récupération tentative testId=${testId}, targetId=${targetId} :`, error);
        return throwError(error);
      })
    );
  }

  getTargetIds(testId: number): Observable<number[]> {
  const url = `${environment.testResultsApiUrl}/targets/${testId}`;
  console.log(`[API] Récupération des target_ids pour testId=${testId}`);
  return this.http.get<number[]>(url).pipe(
    tap(ids => console.log(`[API] Target_ids reçus pour testId=${testId} :`, ids)),
    catchError(err => {
      console.error(`[API] Erreur récupération target_ids testId=${testId}:`, err);
      return throwError(err);
    })
  );
}



  getQoSResultsByTestId(testId: number): Observable<QoSMetrics[]> {
    const url = `${environment.qosResultsApiUrl}/${testId}`;
    console.log(`🌐 Appel API QoS pour test ID = ${testId}`);
    return this.http.get<QoSMetrics[]>(url).pipe(
      tap((data) => {
        console.log(`✅ Résultats QoS reçus pour test ID = ${testId} :`, data);
      }),
      catchError(error => {
        console.error(`❌ Erreur récupération QoS pour test ID = ${testId} :`, error);
        return throwError(error);
      })
    );
  }
}

