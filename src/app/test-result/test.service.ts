import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TestResult } from './test-result.model';
import { environment } from '../../environments/environment';

// testResultsApiUrl: 'http://localhost:5000/api/test-results',
@Injectable({
  providedIn: 'root'
})
export class TestService {

  private apiUrl = environment.testResultsApiUrl;

  constructor(private http: HttpClient) {}

  getTestResults(): Observable<TestResult[]> {
    return this.http.get<TestResult[]>(this.apiUrl);
  }

 getTestResultDetails(id: number): Observable<TestResult> {
  console.log(`📦 Appel API: récupération du test avec ID = ${id}`);
  return this.http.get<TestResult>(`${this.apiUrl}/${id}`);
}


  deleteTestResult(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
