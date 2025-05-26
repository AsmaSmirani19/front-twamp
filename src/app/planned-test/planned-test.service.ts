import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlannedTestInfo {
  testID: number;
  testName: string;
  testDuration: number;
  creationDate: string;
  sourceAgent: string;
  targetAgent: string;
  thresholdName: string;
  thresholdValue: number;
  profileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class PlannedTestService {
  private apiUrl = environment.plannedTestApiUrl;

  constructor(private http: HttpClient) {}

    // planned-test.service.ts
getPlannedTestById(id: number): Observable<PlannedTestInfo> {
    return this.http.get<PlannedTestInfo>(`${this.apiUrl}?id=${id}`);
}
}
