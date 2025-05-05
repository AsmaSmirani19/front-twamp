import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface TestProfile {
  id?: number;
  profile_name: string;
  creation_date: string;
  packet_size: number;
}

@Injectable({
  providedIn: 'root',
})
export class TestProfileService {

  // Constructeur injectant HttpClient
  constructor(private http: HttpClient) {}

  // Méthode pour récupérer tous les test profiles
  getTestProfiles(): Observable<TestProfile[]> {
    return this.http.get<TestProfile[]>(environment.testProfileApiUrl);
  }

  // Méthode pour créer un test profile
  createTestProfile(testProfile: TestProfile): Observable<TestProfile> {
    const { id, ...testProfileWithoutId } = testProfile;
    return this.http.post<TestProfile>(environment.testProfileApiUrl, testProfileWithoutId);
  }
  

  // Méthode pour mettre à jour un test profile
  updateTestProfile(testProfile: TestProfile): Observable<TestProfile> {
    return this.http.put<TestProfile>(`${environment.testProfileApiUrl}/${testProfile.id}`, testProfile);
  }

  // Méthode pour supprimer un test profile
  deleteTestProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.testProfileApiUrl}?id=${id}`);
  }
}
