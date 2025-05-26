import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketService, TestStatus } from './web-socket.service';
import { TestService } from './test.service'; 
import { TestResult } from './test-result.model';

type AllowedStatus = 'error' | 'unknown' | 'in_progress' | 'completed' | 'failed';

function normalizeStatus(status?: string): AllowedStatus {
  const allowedStatuses: AllowedStatus[] = ['error', 'unknown', 'in_progress', 'completed', 'failed'];
  return (status && allowedStatuses.includes(status as AllowedStatus))
    ? status as AllowedStatus
    : 'unknown';
}

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss']
})
export class TestResultComponent implements OnInit, OnDestroy {

  testResults: TestResult[] = [];
  selectedResult: TestResult | null = null;

  private wsSubscription?: Subscription;

  constructor(
    private wsService: WebSocketService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    console.log("Chargement initial...");
    // Chargement initial des résultats via HTTP
    this.testService.getTestResults().subscribe({
      next: (results: any[]) => {
        console.log('Résultats reçus du backend :', results);
        this.testResults = results.map((item, index) => ({
        test_id: (item.test_id !== undefined && item.test_id !== null) ? item.test_id : index,
        testName: item.test_name ?? `Test ${index}`,
        testType: item.test_type ?? 'Inconnu',
        creationDate: item.creation_date ?? new Date().toISOString(),
        testDuration: item.test_duration ?? '00:00',
        sourceAgent: item.source_agent ?? 'N/A',
        targetAgent: item.target_agent ?? 'N/A',
        status: normalizeStatus(item.status)
      }));
      },
      error: (err) => {
        console.error("Erreur lors du chargement des résultats :", err);
      }
    });

    // Écoute des mises à jour via WebSocket
    this.wsSubscription = this.wsService.statusUpdates$.subscribe({
      next: (statusUpdate: TestStatus) => {
        console.log('Mise à jour WebSocket reçue :', statusUpdate);
        this.refreshTestFromBackend(statusUpdate.test_id);
      },
      error: (err) => {
        console.error('Erreur dans la connexion WebSocket :', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  /**
   * Recharge les détails du test depuis le backend HTTP en cas de mise à jour
   */
    private refreshTestFromBackend(testId: number): void {
    if (!testId || testId <= 0) {
      console.warn(`testId non valide pour rafraîchissement : ${testId}`);
      return;
    }
    this.testService.getTestResultDetails(testId).subscribe({
      next: (details: TestResult) => {
        const index = this.testResults.findIndex(t => t.test_id === testId);
        if (index !== -1) {
          this.testResults[index] = { ...this.testResults[index], ...details };
        } else {
          this.testResults.push(details);
        }
        this.testResults = [...this.testResults];
      },
      error: (error) => {
        console.error(`Erreur de récupération des détails pour le test ${testId}`, error);
      }
    });
  }

  /**
   * Affiche les détails d’un test sélectionné
   */
  onView(result: TestResult): void {
    console.log("🔍 Test sélectionné :", result);

    // Vérification de la validité de l'ID
    const testId = result?.test_id;
    if (!testId || testId <= 0) {
      console.error('❌ ID de test invalide ou manquant :', testId);
      alert(`ID de test invalide : ${testId}`);
      return;
    }

    console.log(`📦 Appel API pour les détails du test ID=${testId}`);

    this.testService.getTestResultDetails(testId).subscribe({
      next: (details: TestResult) => {
        console.log("✅ Détails du test reçus :", details);
        this.selectedResult = details;
      },
      error: (error) => {
        console.error(`❌ Erreur lors de la récupération des détails pour le test ${testId} :`, error);
        alert(`Erreur : impossible de récupérer les détails pour le test ${testId}`);
      }
    });
  }

  /**
   * Supprime un test
   */
  onDelete(result: TestResult): void {
    if (result.test_id == null) {
      console.error('test_id est null ou undefined pour la suppression');
      return;
    }

    this.testService.deleteTestResult(result.test_id).subscribe({
      next: () => {
        this.testResults = this.testResults.filter(t => t.test_id !== result.test_id);
      },
      error: (error) => {
        console.error(`Erreur lors de la suppression du test ${result.test_id} :`, error);
      }
    });
  }

  

  /**
   * Ferme le popup de détails
   */
  closePopup(): void {
    this.selectedResult = null;
  }

  /**
   * Retourne la classe CSS selon le statut du test
   */
  getStatusClass(status?: string): string {
    switch ((status ?? '').toLowerCase()) {
      case 'completed':
        return 'tag-success';
      case 'in_progress':
        return 'tag-warning';
      case 'failed':
      case 'error':
        return 'tag-danger';
      default:
        return 'tag-secondary';
    }
  }
}
