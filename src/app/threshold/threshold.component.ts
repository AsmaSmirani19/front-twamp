import { Component, OnInit } from '@angular/core';
import { ThresholdService } from './threshold.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-threshold',
  templateUrl: './threshold.component.html',
  styleUrls: ['./threshold.component.scss']
})
export class ThresholdComponent implements OnInit {
  thresholds: any[] = [];
  showPopup = false;
  selectedProfile: any = null;

  // Formulaire de création
  newThreshold = {
    name: '',
    selectedMetric: 'latency'
  };

  data: any[] = [];
  activeData: any[] = [];
  disabledData: any[] = [];

  metricUnit = 'ms';

  thresholdMetrics = [
    { label: 'Min Value', operator: '', value: '', enabled: true },
    { label: 'Max Value', operator: '', value: '', enabled: true },
    { label: 'Avg Value', operator: '', value: '', enabled: true }
  ];

  activeThresholds: string[] = [];
  disabledThresholds: string[] = [];

  constructor(private thresholdService: ThresholdService) {}

  ngOnInit(): void {
    this.loadAndProcessThresholds();
  }

  loadAndProcessThresholds(): void {
    this.thresholdService.getThresholds().pipe(
      catchError(err => {
        console.error('Erreur lors de getThresholds()', err);
        return of([]);
      })
    ).subscribe(data => {
      this.thresholds = data;

      if (data.length > 0) {
        const threshold = data[0];

        this.activeThresholds = Array.isArray(threshold.active_thresholds)
          ? threshold.active_thresholds
          : threshold.active_thresholds?.split(',') || [];

        this.disabledThresholds = Array.isArray(threshold.disabled_thresholds)
          ? threshold.disabled_thresholds
          : threshold.disabled_thresholds?.split(',') || [];
      }

      this.data = data;
      this.activeData = data.filter(item =>
        item.avg_status === 1 || item.min_status === 1 || item.max_status === 1
      );
      this.disabledData = data.filter(item =>
        item.avg_status === 0 && item.min_status === 0 && item.max_status === 0
      );
    });
  }

  onView(profile: any): void {
    this.selectedProfile = profile;
    this.showPopup = true;
  }

  onDelete(profile: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce threshold ?')) {
      this.thresholdService.deleteThreshold(profile.id).subscribe({
        next: () => this.loadAndProcessThresholds(),
        error: (err) => console.error('Erreur lors de la suppression du threshold', err)
      });
    }
  }

  onMetricChange(): void {
    switch (this.newThreshold.selectedMetric) {
      case 'latency':
      case 'jitter':
        this.metricUnit = 'ms';
        break;
      case 'bandwidth':
        this.metricUnit = 'Mbps';
        break;
      case 'packetLoss':
        this.metricUnit = '%';
        break;
      default:
        this.metricUnit = 'ms';
    }
  }

  private parseNumber(value: any): number {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  createThreshold(): void {
    if (!this.newThreshold.name.trim()) {
      console.error("Le nom du profil est requis.");
      return;
    }

    const avgMetric = this.thresholdMetrics.find(m => m.label === 'Avg Value');
    const minMetric = this.thresholdMetrics.find(m => m.label === 'Min Value');
    const maxMetric = this.thresholdMetrics.find(m => m.label === 'Max Value');

    const thresholdData: any = {
      name: this.newThreshold.name,
      creation_date: new Date().toISOString(),
      avg: 0,
      min: 0,
      max: 0,
      avg_opr: '',
      min_opr: '',
      max_opr: '',
      avg_status: false,
      min_status: false,
      max_status: false,
      active_threshold: this.activeThresholds,
      disabled_threshold: this.disabledThresholds,
      selected_metric: this.newThreshold.selectedMetric
    };

    if (avgMetric?.enabled) {
      thresholdData.avg = this.parseNumber(avgMetric.value);
      thresholdData.avg_opr = avgMetric.operator || '';
      thresholdData.avg_status = !!(avgMetric.operator && avgMetric.value);
    }

    if (minMetric?.enabled) {
      thresholdData.min = this.parseNumber(minMetric.value);
      thresholdData.min_opr = minMetric.operator || '';
      thresholdData.min_status = !!(minMetric.operator && minMetric.value);
    }

    if (maxMetric?.enabled) {
      thresholdData.max = this.parseNumber(maxMetric.value);
      thresholdData.max_opr = maxMetric.operator || '';
      thresholdData.max_status = !!(maxMetric.operator && maxMetric.value);
    }

    console.log('Données envoyées:', thresholdData);

    this.thresholdService.createThreshold(thresholdData).subscribe({
      next: () => {
        console.log('Threshold créé avec succès');
        this.loadAndProcessThresholds();
        this.showPopup = false;
        this.resetForm();
      },
      error: (err) => console.error('Erreur lors de la création du threshold', err)
    });
  }

  resetForm(): void {
    this.newThreshold = {
      name: '',
      selectedMetric: 'latency'
    };
    this.metricUnit = 'ms';
    this.thresholdMetrics.forEach(metric => {
      metric.operator = '';
      metric.value = '';
      metric.enabled = true;
    });
  }

  onToggleMetric(index: number): void {
    this.thresholdMetrics.forEach((metric, i) => {
      metric.enabled = i === index;
    });
  }
}
