import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

export interface TestStatus {
  test_id: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private statusSubject = new Subject<TestStatus>();
  public statusUpdates$: Observable<TestStatus> = this.statusSubject.asObservable();

  constructor() {
    // Utilise l'URL du fichier environment
    this.socket$ = webSocket(environment.webSocketUrl);

    this.socket$.subscribe({
      next: (msg) => {
        console.log('Message WS reçu:', msg);
        if (msg.test_id !== undefined && msg.status) {
          this.statusSubject.next(msg);
        } else if (msg.type === 'status' && msg.payload) {
          const p = msg.payload;
          if (p.test_id !== undefined && p.status) {
            this.statusSubject.next(p);
          }
        } else {
          console.warn('Message WS ignoré:', msg);
        }
      },
      error: (err) => {
        console.error('❌ WebSocket error:', err);
      },
      complete: () => {
        console.warn('WebSocket closed');
      }
    });
  }
}
