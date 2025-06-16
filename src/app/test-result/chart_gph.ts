import { ChartOptions, ChartData } from 'chart.js';

// Définition de l'interface AttemptResult pour le typage
export interface AttemptResult {
  test_id: number;
  target_id: number;
  latency_ms: number;
  jitter_ms: number;
  throughput_kbps: number;
}

// --- Fonctions utilitaires pures ---

export function createChartOptions(
  selectedMetric: string,
  getThreshold: (metric: string) => number | null
): ChartOptions<'line'> {
  const threshold = getThreshold(selectedMetric);

  const options: ChartOptions<'line'> = {
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
        annotations: {}
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

  if (threshold != null && threshold > 0) {
    options.plugins.annotation.annotations = {
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
          font: { weight: 'bold' }
        }
      }
    };
  }

  return options;
}

export function getChartOptions(
  threshold: number | null,
  selectedMetric: string,
  currentMetric: string,
  thresholdType?: string,
  thresholdOperator?: string
): ChartOptions<'line'> {
  const showThreshold = threshold !== null && currentMetric === selectedMetric;

  const labelText = showThreshold
    ? `Seuil ${thresholdOperator ?? ''} (${selectedMetric}) : ${threshold} ms (valeurs doivent être ${thresholdType ?? ''} ${threshold} ms)`
    : '';

  return {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0.3 }, point: { radius: 3, hoverRadius: 5 } },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { enabled: true, mode: 'index', intersect: false },
      annotation: {
        annotations: showThreshold
          ? {
              thresholdLine: {
                type: 'line',
                scaleID: 'y',
                value: threshold!,
                borderColor: 'red',
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  enabled: true,
                  content: labelText,
                  position: 'start',
                  backgroundColor: 'rgba(255, 0, 0, 0.7)',
                  color: 'white',
                  font: { weight: 'bold' },
                  padding: 6
                }
              }
            }
          : {}
      }
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Tentatives' } },
      y: { display: true, title: { display: true, text: 'Valeur (ms)' }, beginAtZero: true, type: 'linear' }
    }
  };
}

export function hasValidChartData(chart: ChartData<'line'>): boolean {
  const isValid =
    Array.isArray(chart?.datasets) &&
    chart.datasets.length > 0 &&
    Array.isArray(chart.datasets[0].data) &&
    chart.datasets[0].data.length > 0;

  console.log('[DEBUG] Chart data valid:', isValid, chart);
  return isValid;
}

export function getColorForAgent(agentId: number): string {
  const colors = ['blue', 'green', 'red', 'orange', 'purple', 'teal', 'brown', 'magenta'];
  return colors[agentId % colors.length];
}

// --- Classe ChartUtils ---

export class ChartUtils {
  attemptResults: AttemptResult[] = [];
  chartOptions: ChartOptions<'line'> = {};
  chart?: { update: () => void }; // typer plus précisément si possible

  constructor(attemptResults?: AttemptResult[], chartOptions?: ChartOptions<'line'>, chart?: { update: () => void }) {
    if (attemptResults) this.attemptResults = attemptResults;
    if (chartOptions) this.chartOptions = chartOptions;
    if (chart) this.chart = chart;
  }

  normalizeThroughput(value?: number): number {
    if (typeof value !== 'number' || value < 0) {
      console.warn('[normalizeThroughput] Valeur invalide :', value);
      return 0;
    }
    return value;
  }

  filterOutliers(data: number[], threshold = 3): number[] {
    if (data.length === 0) return data;

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const stdDev = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / data.length);

    return data.map((val) => {
      const zScore = (val - mean) / stdDev;
      return Math.abs(zScore) > threshold ? mean : val;
    });
  }

  private updateThresholdLine(threshold: number): void {
    if (!this.chartOptions.plugins?.annotation?.annotations) {
      this.chartOptions.plugins = {
        ...this.chartOptions.plugins,
        annotation: { annotations: {} }
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

    this.chart?.update();
  }

getLatencyData(): number[] {
  return this.attemptResults?.map((item, index) => {
    const value = item.latency_ms ?? 0;
    return value;
  }) ?? [];
}


getJitterData(): number[] {
  return this.attemptResults?.map((item, index) => {
    const value = item.jitter_ms ?? item.jitter_ms ?? 0;
    return value;
  }) ?? [];
}

getThroughputData(): number[] {
  return this.attemptResults?.map((item, index) => {
    const value = item.throughput_kbps ?? item.throughput_kbps ?? 0;
    return this.normalizeThroughput(value);
  }) ?? [];
}




initChartsData(attemptResults: AttemptResult[]) {
  if (!attemptResults.length) {
    console.warn('[initChartsData] Aucune donnée pour initialiser les graphiques.');
    return null;
  }

  const chartLabels = attemptResults.map((_, idx) => `Point ${idx + 1}`);

  const latencyChart: ChartData<'line'> = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Latency (ms)',
        data: attemptResults.map((ar) => ar.latency_ms ?? 0),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true
      }
    ]
  };

  const latencyChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const jitterChart: ChartData<'line'> = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Jitter (ms)',
        data: attemptResults.map((ar) => ar.jitter_ms ?? 0),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: true
      }
    ]
  };

  const jitterChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  const throughputChart: ChartData<'line'> = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Throughput (Mbps)',
        data: attemptResults.map((ar) => this.normalizeThroughput(ar.throughput_kbps)),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: true
      }
    ]
  };

  const throughputChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return {
    latencyChart,
    latencyChartOptions,
    jitterChart,
    jitterChartOptions,
    throughputChart,
    throughputChartOptions
  };
}

}
