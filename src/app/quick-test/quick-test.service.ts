import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuickTestService {
  private quickTestUrl = environment.quickTestApiUrl;

  constructor(private http: HttpClient) {}

  launchQuickTest(data: any): Observable<any> {
    return this.http.post<any>(this.quickTestUrl, data);
  }
}
