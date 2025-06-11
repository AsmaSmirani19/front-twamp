import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { WebSocketService, TestStatus } from './web-socket.service';
import { TestService } from './test.service';
import { TestResult } from './test-result.model';
import {
  Chart,
  registerables
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Enregistre tous les composants nécessaires (axes, légendes, etc.)
Chart.register(...registerables, annotationPlugin);



type AllowedStatus = 'error' | 'unknown' | 'in_progress' | 'completed' | 'failed';

function normalizeStatus(status?: string): AllowedStatus {
  const allowedStatuses: AllowedStatus[] = ['error', 'unknown', 'in_progress', 'completed', 'failed'];
  return (status && allowedStatuses.includes(status as AllowedStatus))
    ? (status as AllowedStatus)
    : 'unknown';
}

export interface AttemptResult {
  latency?: number;
  jitter?: number;
  throughput?: number;
}

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss']
})


export class TestResultComponent implements OnInit, OnDestroy {

  
  testResults: TestResult[] = [];
  selectedResult: TestResult | null = null;
  attemptResults: AttemptResult[] = [];

  @ViewChild('latencyChartRef', { static: false, read: BaseChartDirective }) latencyChartRef?: BaseChartDirective;
  @ViewChild('jitterChartRef', { static: false, read: BaseChartDirective }) jitterChartRef?: BaseChartDirective;
  @ViewChild('throughputChartRef', { static: false, read: BaseChartDirective }) throughputChartRef?: BaseChartDirective;
  @ViewChild('chart') chart: any;


  selectedMetric: string = 'latency';
  chartLabels: string[] = [];
  
  latencyChart: ChartData<'line'> = { labels: [], datasets: [] };
  jitterChart: ChartData<'line'> = { labels: [], datasets: [] };
  throughputChart: ChartData<'line'> = { labels: [], datasets: [] };

get chartOptions(): ChartOptions<'line'> {
  const threshold = this.getThresholdForSelectedMetric(this.selectedMetric);  // selectedMetric = 'latency', etc.

  return {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.3 },
      point: { radius: 3, hoverRadius: 5 }
    },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              if (label.toLowerCase().includes('throughput')) {
                label += value > 100 ? `${value.toFixed(2)} Mbps` : `${value.toFixed(4)} Mbps`;
              } else if (label.toLowerCase().includes('latency') || label.toLowerCase().includes('jitter')) {
                label += value.toFixed(4) + ' ms';
              } else {
                label += value.toFixed(2);
              }
            }
            return label;
          }
        }
      },
      annotation: {
        annotations: threshold != null && threshold > 0 ? {
          thresholdLine: {
            type: 'line',
            yMin: threshold,
            yMax: threshold,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: `Seuil = ${threshold}`,
              enabled: true,
              position: 'center',
              color: 'red',
              font: {
                weight: 'bold'
              }
            }
          }
        } : {}
      }
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Tentatives' },
        ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 }
      },
      y: {
        display: true,
        title: { display: true, text: 'Valeur' },
        beginAtZero: true,
        type: 'linear'
      }
    }
  };
}


  private wsSubscription?: Subscription;

  constructor(
    private wsService: WebSocketService,
    private testService: TestService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit(): void {
  this.testService.getTestResults().subscribe({
  next: (results: any[]) => {
    this.testResults = results.map((item, index) => ({
      test_id: item.test_id ?? index,
      testName: item.test_name ?? `Test ${index}`,
      testType: item.test_type ?? 'Inconnu',
      creationDate: item.creation_date ?? new Date().toISOString(),
      testDuration: item.test_duration ?? '00:00',
      sourceAgent: item.source_agent ?? 'N/A',
      targetAgent: item.target_agent ?? 'N/A',
      status: normalizeStatus(item.status),

      minValue: item.min_value,
      maxValue: item.max_value,
      avgValue: item.avg_value,
      successRate: item.success_rate,

      thresholdName: item.threshold_name ?? item.selected_metrics,  // optionnel
      thresholdValue: item.threshold_value ?? null,
      
      selectedMetric: item.selected_metrics ?? 'latency' // ✅ ici on met selectedMetric
    }));
  },
  error: (err) => {
    console.error("Erreur chargement résultats :", err);
  }
});


  this.wsSubscription = this.wsService.statusUpdates$.subscribe({
    next: (statusUpdate: TestStatus) => {
      this.refreshTestFromBackend(statusUpdate.test_id);
    },
    error: (err) => {
      console.error('Erreur WebSocket :', err);
    }
  });
}

ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

private refreshTestFromBackend(testId: number): void {
  console.log('[CALL] refreshTestFromBackend appelé pour testId:', testId);

  // ✅ Vérification initiale
  if (!testId || testId <= 0) {
    console.warn('⚠️ ID de test invalide, annulation de la requête.');
    return;
  }

  this.testService.getTestResultDetails(testId).subscribe({
    next: (details: TestResult) => {
      if (!details) {
        console.warn('⚠️ Détails du test introuvables dans la réponse.');
        return;
      }

      console.log('✅ Données reçues de l’API (raw):', JSON.stringify(details, null, 2));
      console.log('🔎 thresholdName:', details.thresholdName);
      console.log('🔎 thresholdValue:', details.thresholdValue);

      // ✅ Mise à jour ou ajout dans la liste des résultats
      const index = this.testResults.findIndex(t => t.test_id === testId);
      if (index !== -1) {
        this.testResults[index] = { ...this.testResults[index], ...details };
      } else {
        this.testResults.push(details);
      }

      // ✅ Forcer le déclenchement de changement dans le tableau
      this.testResults = [...this.testResults];

      // ✅ Sélectionner le résultat
      this.selectedResult = details;

      console.log('📋 selectedResult final:', JSON.stringify(this.selectedResult, null, 2));
      console.log('📊 Métrique sélectionnée :', this.selectedResult.selectedMetric);

      // ✅ Mise à jour des graphiques via fonction centralisée
      this.updateCharts();

      // ✅ Mise à jour de l'affichage Angular
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error(`❌ Erreur lors du chargement des détails du test ${testId} :`, error);
    }
  });
}

private updateCharts(): void {
  if (!this.selectedResult) {
    console.warn('[updateCharts] Aucune donnée sélectionnée pour mise à jour des graphiques.');
    return;
  }

  this.cdr.detectChanges();

  setTimeout(() => {
    try {
      const selectedMetric = this.selectedResult.selectedMetric;
      const thresholdValue = this.selectedResult.thresholdValue;

      const updateChart = (chartRef: any, metricName: string) => {
        const chart = chartRef?.chart;
        if (!chart) return;

        const shouldShowThreshold = selectedMetric === metricName;
        const threshold = shouldShowThreshold ? thresholdValue : null;

        // Réinitialiser les anciennes annotations
        if (chart.options.plugins?.annotation?.annotations) {
          chart.options.plugins.annotation.annotations = {};
        }

        // Appliquer les nouvelles options
        chart.options = {
          ...chart.options,
          plugins: {
            ...chart.options.plugins,
            annotation: this.getChartOptions(threshold, selectedMetric, metricName)?.plugins?.annotation
          }
        };

        chart.update();

        console.log(`✅ [${metricName}] seuil visible: ${shouldShowThreshold ? thresholdValue : 'non'}`);
      };

      updateChart(this.latencyChartRef, 'latency');
      updateChart(this.jitterChartRef, 'jitter');
      updateChart(this.throughputChartRef, 'throughput');
    } catch (err) {
      console.error('[updateCharts] Erreur lors de la mise à jour des graphiques :', err);
    }
  }, 0);
}




 switchMetric(metric: string): void {
  this.selectedMetric = metric;

  // Ajout d'un délai pour laisser le DOM se mettre à jour
  setTimeout(() => {
    this.updateCharts();
  }, 300);
}

  
  onView(result: TestResult): void {
    const testId = result?.test_id;
    if (!testId || testId <= 0) return;

    console.log('[onView] Selected TestResult ID:', testId);

    this.clearChartsData();
   
    this.selectedResult = result;
    this.refreshTestFromBackend(testId); // ← AJOUTER CETTE LIGNE
    this.cdr.detectChanges();


    this.testService.getAttemptResults(testId).subscribe({
      next: (data: AttemptResult[]) => {
        if (!data || data.length === 0) {
          console.warn('[onView] Aucune donnée reçue pour les tentatives');
          return;
        }

        this.attemptResults = data;
      this.chartLabels = data.map((_, i) => `Attempt ${i + 1}`);

  const latencyData = this.getLatencyData();      // tableau de nombres
  const jitterData = this.getJitterData();        // idem
  const throughputData = this.getThroughputData(); // idem

  // Vérifie que longueur des labels == longueur des datasets
  if (
    latencyData.length !== this.chartLabels.length ||
    jitterData.length !== this.chartLabels.length ||
    throughputData.length !== this.chartLabels.length
  ) {
    console.warn('[onView] Les données de chart ne correspondent pas aux labels');
    return;
  }

  this.latencyChart.labels = this.chartLabels;
  this.latencyChart.datasets = [{
    data: latencyData,
    label: 'Latency',
    borderColor: 'blue',
    fill: false,
  }];

  this.jitterChart.labels = this.chartLabels;
  this.jitterChart.datasets = [{
    data: jitterData,
    label: 'Jitter',
    borderColor: 'green',
    fill: false,
  }];

  this.throughputChart.labels = this.chartLabels;
  this.throughputChart.datasets = [{
    data: throughputData,
    label: 'Throughput',
    borderColor: 'red',
    fill: false,
  }];

  this.cdr.detectChanges();

  setTimeout(() => {
    [this.latencyChartRef, this.jitterChartRef, this.throughputChartRef].forEach(chart => {
      if (chart?.chart) {
        chart.chart.update();
        chart.chart.render();
      }
    });
  }, 200);

      },
      error: (err) => {
        console.error('[onView] Erreur récupération tentative:', err);
        this.clearChartsData();
        this.cdr.detectChanges();
      }
    });
  }


  clearChartsData(): void {
  console.log('[clearChartsData] Réinitialisation des données des graphiques.');
  this.latencyChart = { labels: [], datasets: [] };
  this.jitterChart = { labels: [], datasets: [] };
  this.throughputChart = { labels: [], datasets: [] };
}


  initChartsData(): void {
    if (!this.chartLabels.length || !this.attemptResults.length) {
      console.warn('[initChartsData] Aucune donnée pour initialiser les graphiques.');
      return;
    }

    // Initialisation du graphique de latence
    this.latencyChart = {
      labels: this.chartLabels,
      datasets: [{
        label: 'Latency (ms)',
        data: this.getLatencyData(),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      }]
    };

    // Initialisation du graphique de jitter
    this.jitterChart = {
      labels: this.chartLabels,
      datasets: [{
        label: 'Jitter (ms)',
        data: this.getJitterData(),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true
      }]
    };

    // Initialisation du graphique de débit
    this.throughputChart = {
      labels: this.chartLabels,
      datasets: [{
        label: 'Throughput (Mbps)',
        data: this.getThroughputData(),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true
      }]
    };

    // Mise à jour des graphiques
    this.updateCharts();
  }


  getLatencyData(): number[] {
    const result = this.attemptResults?.map((item, index) => {
      const value = item.latency;
      if (typeof value !== 'number') {
        console.warn(`[getLatencyData] Valeur de latence invalide à l'index ${index} :`, value);
      }
      return typeof value === 'number' ? value : 0;
    }) ?? [];

    console.log('[getLatencyData] Résultat:', result);
    return result;
  }

  getJitterData(): number[] {
    const result = this.attemptResults?.map((item, index) => {
      if (item.jitter === undefined || item.jitter === null) {
        console.warn(`[getJitterData] Jitter manquant à l'index ${index}.`);
      }
      return item.jitter ?? 0;
    }) ?? [];

    console.log('[getJitterData] Résultat:', result);
    return result;
  }

  getThroughputData(): number[] {
    const result = this.attemptResults?.map((item, index) => {
      const norm = this.normalizeThroughput(item.throughput);
      if (typeof norm !== 'number') {
        console.warn(`[getThroughputData] Valeur de débit anormale à l'index ${index} :`, item.throughput);
      }
      return norm;
    }) ?? [];

    console.log('[getThroughputData] Résultat:', result);
    return result;
  }

hasValidChartData(chart: ChartData<'line'>): boolean {
  const isValid = Array.isArray(chart?.datasets) &&
         chart.datasets.length > 0 &&
         Array.isArray(chart.datasets[0].data) &&
         chart.datasets[0].data.length > 0;
  console.log(`[DEBUG] Chart data valid: ${isValid}`, chart);
  return isValid;
}

ngAfterViewInit() {
  const canvas = document.getElementById("latencyChart");
  console.log("Canvas element:", canvas);
}

  onDelete(result: TestResult): void {
    if (!result.test_id) return;

    this.testService.deleteTestResult(result.test_id).subscribe({
      next: () => {
        this.testResults = this.testResults.filter(t => t.test_id !== result.test_id);
      },
      error: (error) => {
        console.error(`Erreur suppression test ${result.test_id} :`, error);
      }
    });
  }

 normalizeThroughput(value?: number): number {
  if (typeof value !== 'number' || value < 0) {
    console.warn('[normalizeThroughput] Valeur invalide :', value);
    return 0;
  }
  return value;
}
  private filterOutliers(data: number[], threshold = 3): number[] {
    if (data.length === 0) return data;

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length);

    return data.map(val => {
      const zScore = (val - mean) / stdDev;
      return Math.abs(zScore) > threshold ? mean : val;
    });
  }

private updateThresholdLine(threshold: number): void {
  if (!this.chartOptions.plugins?.annotation?.annotations) {
    this.chartOptions.plugins = {
      ...this.chartOptions.plugins,
      annotation: {
        annotations: {}
      }
    };
  }

  this.chartOptions.plugins.annotation.annotations['thresholdLine'] = {
    type: 'line',
    yMin: threshold,
    yMax: threshold,
    borderColor: 'red',
    borderWidth: 2,
    label: {
      content: `Seuil = ${threshold}`,
      enabled: true,
      position: 'end',
      color: 'red'
    }
  };

  this.chart?.update(); // Redessine la courbe avec la nouvelle ligne
}

getChartOptions(threshold: number | null, selectedMetric: string, currentMetric: string): any {
  const showThreshold = threshold !== null && selectedMetric === currentMetric;

  return {
    responsive: true,
    plugins: {
      annotation: {
        annotations: showThreshold
          ? {
              thresholdLine: {
                type: 'line',
                yMin: threshold,
                yMax: threshold,
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  enabled: true,
                  content: `Seuil: ${threshold}`,
                  position: 'start',
                  backgroundColor: 'rgba(255,0,0,0.7)',
                  color: 'white'
                }
              }
            }
          : {}
      }
    }
  };
}

getThresholdForSelectedMetric(metric: string): number {
  if (this.selectedResult && this.selectedResult.selectedMetric === metric) {
    return this.selectedResult.thresholdValue || 0;
  }
  return 0;
}


  closePopup(): void {
    this.selectedResult = null;
  }

  openPopup(result: TestResult): void {
  console.log('[openPopup] Selected TestResult:', result);  // 👈 ajoute ceci

  this.selectedResult = result;

  // ✅ recharge les détails depuis le backend
  if (result.test_id) {
    console.log('[openPopup] Appel refreshTestFromBackend avec ID:', result.test_id); // 👈 ajoute ceci aussi
    this.refreshTestFromBackend(result.test_id);
  } else {
    console.warn('[openPopup] test_id manquant');
  }
}


  getStatusClass(status?: string): string {
    switch ((status ?? '').toLowerCase()) {
      case 'completed': return 'tag-success';
      case 'in_progress': return 'tag-warning';
      case 'failed':
      case 'error': return 'tag-danger';
      default: return 'tag-secondary';
    }
  }
}
