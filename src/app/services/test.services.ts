import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

  
export interface TestDto {
  id?: number;
  test_name: string;
  test_duration: string;
  number_of_agents: number;
  creation_date: string;

  isPaused?: boolean;

  test_type: 'quick_test' | 'planned_test';
  source_id?: number;
  target_id?: number;
  profile_id?: number;
  threshold_id?: number;

  inProgress?: boolean;
  failed?: boolean;
  completed?: boolean;
  error?: boolean;
}



@Injectable({
  providedIn: 'root'
})
export class TestService {
  private readonly apiUrl = environment.testsApiUrl;

  constructor(private http: HttpClient) {}

  // Récupérer tous les tests
  getTests(): Observable<TestDto[]> {
    return this.http.get<TestDto[]>(this.apiUrl);
  }

  // Créer un nouveau test
  createTest(test: TestDto): Observable<any> {
    return this.http.post(this.apiUrl, test);
  }

  // Mettre à jour un test existant
  updateTest(test: TestDto): Observable<any> {
    return this.http.put(this.apiUrl, test);
  }

  // Supprimer un test par ID (query param ?id=)
  deleteTest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }

  // lancer le test 
  triggerTest(testId: number, testType: string): Observable<any> {
    return this.http.post('http://localhost:5000/api/trigger-test', {
      test_id: testId,
      test_type: testType
    });
  }

  
  
}
