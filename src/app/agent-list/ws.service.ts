// src/app/agent-list/ws.service.ts
import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';
import { HealthUpdate } from './model'; 



@Injectable({
  providedIn: 'root'
})

export class WsService {
  private socket$: WebSocketSubject<HealthUpdate>;

  constructor() {
    this.socket$ = webSocket<HealthUpdate>('ws://localhost:5000/ws/health');
  }

  getHealthStream(): Observable<HealthUpdate> {
    return this.socket$.asObservable();
  }
}
