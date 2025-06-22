
import {Component,OnInit,OnDestroy,ViewChild,ChangeDetectorRef} from '@angular/core';
import { Subscription } from 'rxjs';
import {Chart,ChartData,ChartOptions,registerables} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { BaseChartDirective } from 'ng2-charts';
import { WebSocketService, TestStatus } from './web-socket.service';
import { TestService } from './test.service';
import { TestResult } from './test-result.model';
import { QoSMetrics } from './test-result.model';
import { AttemptResult } from './test-result.model';
import {getChartOptions,getColorForAgent,hasValidChartData,ChartUtils} from './chart_gph'; // adapte le chemin si besoin


//Chart.register(...registerables, annotationPlugin);

console.log('✅ Chart.js plugins registered');
Chart.register(...registerables, annotationPlugin);


type AllowedStatus = 'error' | 'unknown' | 'in_progress' | 'completed' | 'failed';

function normalizeStatus(status?: string): AllowedStatus {
  const statusMap: Record<string, AllowedStatus> = {
    success: 'completed',
    completed: 'completed',
    failed: 'failed',
    running: 'in_progress',
    in_progress: 'in_progress',
    pending: 'in_progress',
    error: 'error'
  };

  return status ? (statusMap[status.toLowerCase()] ?? 'unknown') : 'unknown';
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

  selectedTargetId: string | null = null;
  
  selectedMetric: string = 'latency';
  chartLabels: string[] = [];
 qosResultsMap: { [testId: number]: QoSMetrics[] } = {};

  latencyChart: ChartData<'line'> = { labels: [], datasets: [] };
  jitterChart: ChartData<'line'> = { labels: [], datasets: [] };
  throughputChart: ChartData<'line'> = { labels: [], datasets: [] };
  testTargetResults: { test_id: number; target_id: number | null; details: TestResult }[] = [];

  availableTargetIds: number[] = [];

  latencyChartOptions!: ChartOptions<'line'>;
  jitterChartOptions!: ChartOptions<'line'>;
  throughputChartOptions!: ChartOptions<'line'>;

 agentChartsData: Array<{
  targetId: number;
  testName: string;
  attemptResults: AttemptResult[];
  latencyChart: ChartData;
  jitterChart: ChartData;
  throughputChart: ChartData;
  latencyChartOptions: ChartOptions;
  jitterChartOptions: ChartOptions;
  throughputChartOptions: ChartOptions;
}> = [];


// Dans test-result.component.ts
public hasValidChartData = hasValidChartData;


  private wsSubscription?: Subscription;

  constructor(
    private wsService: WebSocketService,
    private testService: TestService,
    private cdr: ChangeDetectorRef
  ) {}

aggregateQoSByTarget(qosList: QoSMetrics[] | null): QoSMetrics[] {
  if (!qosList || qosList.length === 0) {
    return [];
  }

  const aggregated: { [targetId: number]: QoSMetrics[] } = {};

  qosList.forEach(qos => {
    if (!aggregated[qos.target_id]) {
      aggregated[qos.target_id] = [];
    }
    aggregated[qos.target_id].push(qos);
  });

  const result: QoSMetrics[] = [];

  for (const targetId in aggregated) {
    const metrics = aggregated[targetId];

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    result.push({
      test_id: metrics[0].test_id,
      target_id: Number(targetId),
      avg_latency_ms: avg(metrics.map(m => m.avg_latency_ms)),
      avg_jitter_ms: avg(metrics.map(m => m.avg_jitter_ms)),
      avg_throughput_kbps: avg(metrics.map(m => m.avg_throughput_kbps)),
      packet_loss_percent: avg(metrics.map(m => m.packet_loss_percent)),
    });
  }

  return result;
}


ngOnInit(): void {
  console.log('[ngOnInit] ✅ Initialisation du composant');

  this.testService.getTestResults().subscribe({
    next: (results: any[]) => {
      console.log('[ngOnInit] 📦 Résultats bruts reçus de l’API:', JSON.stringify(results, null, 2));

      this.testResults = [];
      
    results.forEach((test, testIndex) => {
    const targetIds = Array.isArray(test.TargetIDs) ? test.TargetIDs : [test.TargetIDs];
    const targetAgents = Array.isArray(test.target_agent) ? test.target_agent : [test.target_agent];

    const selectedMetric = test.selected_metrics?.trim() ?? 'latency';
    const thresholds = test.thresholds ?? {};

    // On récupère dynamiquement les seuils en cherchant la clé qui correspond à la métrique sélectionnée
    const matchedKey = Object.keys(thresholds).find(key =>
      key.toLowerCase().includes(selectedMetric.toLowerCase())
    );

    const dynamicThreshold = matchedKey ? thresholds[matchedKey] : {};

    const testResult: TestResult = {
      test_id: test.test_id ?? testIndex,
      target_id: targetIds.map(id => this.toNumber(id)).filter(id => id > 0),
      testName: test.test_name ?? `Test ${testIndex}`,
      testType: test.test_type ?? 'Inconnu',
      creationDate: test.creation_date ?? new Date().toISOString(),
      testDuration: test.test_duration ?? '00:00',
      sourceAgent: test.source_agent ?? 'N/A',
      targetAgent: targetAgents.join(', '),
      status: normalizeStatus(test.status),
      minValue: test.min_value,
      maxValue: test.max_value,
      avgValue: test.avg_value,
      selectedMetric: selectedMetric,
      thresholdName: matchedKey ?? selectedMetric,
      thresholdValue: dynamicThreshold?.value ?? test.threshold_value ?? null,
      thresholdType: dynamicThreshold?.type ?? test.threshold_type ?? 'avg',
      thresholdOperator: dynamicThreshold?.operator ?? test.threshold_operator ?? '<'
    };

    console.log(`[DEBUG][ngOnInit] ✅ test_id=${testResult.test_id} selectedMetric=${selectedMetric} -> seuil:`, {
      key: matchedKey,
      value: testResult.thresholdValue,
      type: testResult.thresholdType,
      operator: testResult.thresholdOperator
    });

    this.testResults.push(testResult);
  });



      console.log('✅ Résultats prêts à afficher (tous tests tel quel):', this.testResults);

      // Chargement des résultats QoS associés
      const uniqueTestIds = new Set(this.testResults.map(tr => tr.test_id));
      uniqueTestIds.forEach(testId => {
        console.log(`🌐 Appel API QoS pour test ID = ${testId}`);
            this.testService.getQoSResultsByTestId(testId).subscribe({
      next: (qosData) => {
        console.log(`✅ Résultats QoS reçus pour test ID = ${testId} :`, qosData);

        // 🔄 Agrégation ici
        const aggregated = this.aggregateQoSByTarget(Array.isArray(qosData) ? qosData : []);

        console.log(`📊 Moyennes agrégées par cible pour test ID ${testId}:`, aggregated);

        this.qosResultsMap[testId] = aggregated;
      },

          error: (err) => {
            console.error(`❌ Erreur QoS test ${testId}:`, err);
            this.qosResultsMap[testId] = [];
          }
        });
      });
    },
    error: (err) => {
      console.error("❌ Erreur lors du chargement des tests:", err);
      this.testResults = [];
    }
  });

  // Mise à jour WebSocket (idem)
  this.wsSubscription = this.wsService.statusUpdates$.subscribe({
    next: (statusUpdate: TestStatus) => {
      console.log(`[ngOnInit][WebSocket] 🔄 Mise à jour reçue pour test_id = ${statusUpdate.test_id}`);
      this.refreshTestFromBackend(statusUpdate.test_id);
    },
    error: (err) => {
      console.error('❌ Erreur WebSocket:', err);
    }
  });
}



toNumber(value: any): number {
  const num = Number(value);
  return isNaN(num) || num <= 0 ? 0 : num;
}

// Fonctions helpers (à ajouter dans la classe)
private ensureArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : ['N/A'];
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
    next: (details: any) => {
      if (!details) {
        console.warn('⚠️ Détails du test introuvables dans la réponse.');
        return;
      }

      console.log('✅ Données reçues de l’API (raw):', JSON.stringify(details, null, 2));

      // Vérification que target_id est défini et valide
      if (details.target_id === undefined || details.target_id === null) {
        console.warn(`[refreshTestFromBackend] ⚠️ target_id manquant ou invalide pour test_id ${testId}. Mise à jour ignorée.`);
        return; // On sort sans rien faire pour éviter d’ajouter un élément avec target_id invalide
      }

      // ✅ Mapping vers l'interface attendue (camelCase)
      const mappedDetails: TestResult = {
        test_id: details.test_id,
        target_id: details.target_id,
        testName: details.test_name,
        testType: details.test_type,
        status: details.status,
        creationDate: details.creation_date,
        testDuration: details.test_duration,
        sourceAgent: details.source_agent,
        targetAgent: details.target_agent,
        thresholdName: details.threshold_name,
        thresholdValue: details.threshold_value,
        selectedMetric: details.selected_metric,
      };

      console.log('[refreshTestFromBackend] target_id reçu:', details.target_id);

      // ✅ Nettoyage des anciennes données pour ce testId dans testTargetResults
      this.testTargetResults = this.testTargetResults.filter(
        item => item.test_id !== testId
      );

      // Ajout des nouvelles données dans testTargetResults
      this.testTargetResults.push({
        test_id: testId,
        target_id: details.target_id,
        details: { ...mappedDetails }
      });

      // Mise à jour ou ajout dans testResults (avec données mappées)
      const index = this.testResults.findIndex(t => t.test_id === testId);
      if (index !== -1) {
        this.testResults[index] = { ...this.testResults[index], ...mappedDetails };
      } else {
        this.testResults.push(mappedDetails);
      }

      // Pour forcer Angular à détecter le changement
      this.testResults = [...this.testResults];

      // Sélection de l’élément pour affichage
      this.selectedResult = mappedDetails;

      console.log('📋 selectedResult final:', JSON.stringify(this.selectedResult, null, 2));

      this.updateCharts();
      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error(`❌ Erreur lors du chargement des détails du test ${testId} :`, error);
    }
  });
}



someMethodUsingCharts(): void {
  const results = this.attemptResults;

  const chartUtils = new ChartUtils();
  const chartsData = chartUtils.initChartsData(results);

  if (chartsData) {
    this.latencyChart = chartsData.latencyChart;
    this.latencyChartOptions = chartsData.latencyChartOptions;
    this.jitterChart = chartsData.jitterChart;
    this.jitterChartOptions = chartsData.jitterChartOptions;
    this.throughputChart = chartsData.throughputChart;
    this.throughputChartOptions = chartsData.throughputChartOptions;
  } else {
    console.warn('[someMethodUsingCharts] Données graphiques non générées.');
  }
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

      // 🔍 Ajout de log pour la vérification
      console.log(`[updateCharts] 📏 thresholdValue pour ${selectedMetric} :`, thresholdValue);

      const getMetricValue = (attempt: AttemptResult, metric: string): number => {
        switch (metric) {
          case 'latency': return attempt.latency_ms;
          case 'jitter': return attempt.jitter_ms;
          case 'throughput': return attempt.throughput_kbps;
          default: return 0;
        }
      };

      const updateChart = (chartRef: any, metricName: string) => {
        const chart = chartRef?.chart;
        if (!chart) return;

        const shouldShowThreshold = selectedMetric === metricName;
        const threshold = shouldShowThreshold ? thresholdValue : null;

        const labels: string[] = [];
        const dataPoints: number[] = [];

        this.selectedResult.attemptResults?.forEach((attempt) => {
          labels.push(`Agent ${attempt.target_id}`);
          dataPoints.push(getMetricValue(attempt, metricName));
        });

        chart.data = {
          labels,
          datasets: [{
            label: `${metricName}`,
            data: dataPoints,
            backgroundColor: 'rgba(75, 192, 192, 0.4)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: true
          }]
        };
        const newOptions = getChartOptions(threshold, selectedMetric, metricName);
        console.log(`🎯 [${metricName}] Options générées :`, newOptions);
        chart.options = newOptions;

        // ⚙️ Passage de la valeur de seuil au bon moment
        chart.options = getChartOptions(threshold, selectedMetric, metricName);
        console.log(`[🧪 [chartupdate] Chart Options Finales pour ${metricName}]`, chart.options);

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
  console.log('[switchMetric] 🔄 Changement de métrique vers :', metric);
  this.selectedMetric = metric;

  // Ajout d'un délai pour laisser le DOM se mettre à jour
  setTimeout(() => {
    this.updateCharts();
  }, 300);
}

onView(result: TestResult): void {
  console.log('[DEBUG] test reçu brut:', result);

  const testId = result?.test_id;
  if (!testId || testId <= 0) {
    console.warn('[onView] ❌ testId invalide ou non fourni:', testId);
    return;
  }

  this.clearChartsData();

  this.testService.getTestResultDetails(testId).subscribe({
    next: (detailedResult) => {
      if (!detailedResult) {
        console.warn('[onView] ⚠️ Détails du test non reçus');
        return;
      }
       // --- NORMALISATION DU STATUT ---
      detailedResult.status = normalizeStatus(detailedResult.status);

      // ✅ Normalisation de la métrique
      let metric = (detailedResult.selectedMetric || (detailedResult as any).selected_metrics || 'latency').trim();
      const validMetrics = ['latency', 'jitter', 'throughput'];
      if (!validMetrics.includes(metric)) metric = 'latency';
      detailedResult.selectedMetric = metric;

      // ✅ Extraction et validation des seuils
      const validTypes = ['min', 'max', 'avg'] as const;
      const validOperators = ['<', '>', '='] as const;
      type ThresholdType = typeof validTypes[number];
      type ThresholdOperator = typeof validOperators[number];

      const thresholdValue: number | null = detailedResult.thresholdValue ?? null;
      const thresholdTypeRaw = detailedResult.thresholdType ?? null;
      const thresholdOperatorRaw = detailedResult.thresholdOperator ?? '=';

      const thresholdType: ThresholdType | null = validTypes.includes(thresholdTypeRaw as ThresholdType)
        ? thresholdTypeRaw as ThresholdType
        : null;

      const thresholdOperator: ThresholdOperator = validOperators.includes(thresholdOperatorRaw as ThresholdOperator)
        ? thresholdOperatorRaw as ThresholdOperator
        : '=';

      detailedResult.thresholdValue = thresholdValue;
      detailedResult.thresholdType = thresholdType;
      detailedResult.thresholdOperator = thresholdOperator;
      this.selectedResult = detailedResult;

      console.log('[onView] 📊 selectedMetric:', metric);
      console.log('[onView] 📏 thresholdValue:', thresholdValue);
      console.log('[onView] ⚖️ thresholdType:', thresholdType);
      console.log('[onView] 🧮 thresholdOperator:', thresholdOperator);
      console.log('[onView] 🟢 statut normalisé:', detailedResult.status);

      this.agentChartsData = [];

      this.testService.getTargetIds(testId).subscribe({
        next: (targetIds) => {
          if (!targetIds || targetIds.length === 0) {
            console.warn(`[onView] ⚠️ Aucun target_id trouvé pour testId ${testId}`);
            return;
          }

          targetIds.forEach(targetId => {
            if (!targetId || targetId <= 0) {
              console.warn('[onView] ❌ targetId invalide:', targetId);
              return;
            }

            this.testService.getAttemptResults(testId, targetId).subscribe({
              next: (data) => {
                if (!data || data.length === 0) {
                  console.warn(`[onView] ⚠️ Aucune donnée reçue pour targetId ${targetId}`);
                  return;
                }

                const validData = data.filter(r => r.target_id && r.target_id > 0);
                if (validData.length === 0) {
                  console.warn(`[onView] ⚠️ Toutes les tentatives invalides pour targetId ${targetId}`);
                  return;
                }

                const labels = validData.map((_, i) => `Attempt ${i + 1}`);
                const chartUtils = new ChartUtils(validData);

                console.log('[onView] 📈 Données à injecter:', {
                  targetId,
                  latency: chartUtils.getLatencyData(),
                  jitter: chartUtils.getJitterData(),
                  throughput: chartUtils.getThroughputData(),
                });

                this.agentChartsData.push({
                  targetId,
                  testName: detailedResult.testName ?? `Test ID ${testId}`,
                  attemptResults: validData,

                  latencyChart: {
                    labels,
                    datasets: [{
                      data: chartUtils.getLatencyData() || [],
                      label: `Latency - Agent ${targetId}`,
                      borderColor: getColorForAgent(targetId),
                      fill: false
                    }]
                  },
                  latencyChartOptions: getChartOptions(
                    thresholdValue, metric, 'latency',
                    thresholdType, thresholdOperator
                  ),

                  jitterChart: {
                    labels,
                    datasets: [{
                      data: chartUtils.getJitterData() || [],
                      label: `Jitter - Agent ${targetId}`,
                      borderColor: getColorForAgent(targetId),
                      fill: false
                    }]
                  },
                  jitterChartOptions: getChartOptions(
                    thresholdValue, metric, 'jitter',
                    thresholdType, thresholdOperator
                  ),

                  throughputChart: {
                    labels,
                    datasets: [{
                      data: chartUtils.getThroughputData() || [],
                      label: `Throughput - Agent ${targetId}`,
                      borderColor: getColorForAgent(targetId),
                      fill: false
                    }]
                  },
                  throughputChartOptions: getChartOptions(
                    thresholdValue, metric, 'throughput',
                    thresholdType, thresholdOperator
                  )
                });

                this.cdr.detectChanges();
              },
              error: (err) => {
                console.error(`[onView] ❌ Erreur récupération tentative pour targetId ${targetId}:`, err);
              }
            });
          });
        },
        error: (err) => {
          console.error(`[onView] ❌ Erreur récupération target_ids pour testId ${testId}:`, err);
        }
      });
    },
    error: (err) => {
      console.error('[onView] ❌ Erreur récupération détails test:', err);
    }
  });
}

selectedChartData: {
  targetId: number;
  testName: string;
  latencyChart: any;
  jitterChart: any;
  throughputChart: any;
} | null = null;

  clearChartsData(): void {
  console.log('[clearChartsData] Réinitialisation des données des graphiques.');
  this.latencyChart = { labels: [], datasets: [] };
  this.jitterChart = { labels: [], datasets: [] };
  this.throughputChart = { labels: [], datasets: [] };
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

getThresholdForSelectedMetric(metric: string): number | null {
  if (this.selectedResult && this.selectedResult.selectedMetric === metric) {
    return this.selectedResult.thresholdValue ?? null; // ✅ retourne null si absent
  }
  return null;
}

  closePopup(): void {
    this.selectedResult = null;
  }
  
trackByTestTargetId(index: number, result: TestResult): string {
  return `${result.test_id}_${result.target_id}`;
}

openPopup(result: TestResult): void {
  console.log('[openPopup] Selected TestResult:', result);

  this.selectedResult = result;

  if (result.test_id) {
    console.log('[openPopup] Appel refreshTestFromBackend avec ID:', result.test_id);
    this.refreshTestFromBackend(result.test_id);

    const qos = this.qosResultsMap[result.test_id];

    if (qos && qos.length > 0) {
  const matchingQos = qos.find(q => Array.isArray(q.target_id) && q.target_id.includes(result.target_id));

  if (matchingQos) {
    this.selectedTargetId = String(matchingQos.target_id);
    console.log('[openPopup] selectedTargetId initialisé à :', this.selectedTargetId);
  } else {
    this.selectedTargetId = String(result.target_id); // fallback
    console.warn('[openPopup] Aucun QoS direct pour ce target, fallback sur result.target_id');
  }

} else {
  this.selectedTargetId = String(result.target_id);
  console.warn('[openPopup] Pas de QoS data, fallback sur result.target_id');
}


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
