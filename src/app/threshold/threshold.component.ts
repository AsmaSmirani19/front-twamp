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

  // Formulaire de création de seuil
  newThreshold = {
    name: '',
    selectedMetric: 'latency'
  };

  data: any[] = [];
  activeData: any[] = [];
  disabledData: any[] = [];

  metricUnit = 'ms'; // Unité par défaut

  // Liste des métriques configurables
  thresholdMetrics = [
    { label: 'Min Value', operator: '', value: '', enabled: true },
    { label: 'Max Value', operator: '', value: '', enabled: true },
    { label: 'Avg Value', operator: '', value: '', enabled: true }
  ];

  activeThresholds: string[] = [];
  disabledThresholds: string[] = [];

  constructor(private thresholdService: ThresholdService) {}

  ngOnInit(): void {
    this.loadThresholds();

    this.thresholdService.getThresholds().subscribe({
      next: (response) => {
        this.data = response.data;

        this.activeData = this.data.filter(item =>
          item.avg_status === 1 || item.min_status === 1 || item.max_status === 1
        );

        this.disabledData = this.data.filter(item =>
          item.avg_status === 0 && item.min_status === 0 && item.max_status === 0
        );
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des données', err);
      }
    });
  }

  loadThresholds(): void {
    this.thresholdService.getThresholds().subscribe({
      next: (data) => {
        this.thresholds = data;
        const threshold = data[0];
        this.activeThresholds = threshold.active_threshold?.split(', ') || [];
        this.disabledThresholds = threshold.disabled_threshold?.split(', ') || [];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des thresholds', err);
      }
    });
  }

  onView(profile: any): void {
    console.log('View threshold:', profile);
    this.showPopup = true;
  }

  onDelete(profile: any): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce threshold ?')) {
      this.thresholdService.deleteThreshold(profile.id).subscribe({
        next: () => {
          this.loadThresholds();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du threshold', err);
        }
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

  // Fonction de parsing sécurisée
  private parseNumber(value: any): number {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  createThreshold(): void {
    if (!this.newThreshold.name.trim()) {
      console.error("Le nom du profil est requis.");
      return;
    }
  
    // Trouver les métriques activées
    const avgMetric = this.thresholdMetrics.find(m => m.label === 'Avg Value');
    const minMetric = this.thresholdMetrics.find(m => m.label === 'Min Value');
    const maxMetric = this.thresholdMetrics.find(m => m.label === 'Max Value');
  
    // Créer l'objet de données à envoyer
    const thresholdData: any = {
      name: this.newThreshold.name,
      creation_date: new Date().toISOString(),
      avg: null, // Par défaut, envoyer null si désactivé
      min: null, // Par défaut, envoyer null si désactivé
      max: null, // Par défaut, envoyer null si désactivé
      avg_opr: '', // Valeur vide par défaut pour l'opérateur
      min_opr: '', // Valeur vide par défaut pour l'opérateur
      max_opr: '', // Valeur vide par défaut pour l'opérateur
      avg_status: false, // Par défaut désactivé
      min_status: false, // Par défaut désactivé
      max_status: false, // Par défaut désactivé
      active_threshold: [],
      disabled_threshold: []
    };
  
    // Remplir avec les valeurs des métriques activées
    if (avgMetric?.enabled) {
      thresholdData.avg = Number(avgMetric.value) || null;
      thresholdData.avg_opr = avgMetric.operator || '';
      thresholdData.avg_status = !!(avgMetric.operator && avgMetric.value);
    }
  
    if (minMetric?.enabled) {
      thresholdData.min = Number(minMetric.value) || null;
      thresholdData.min_opr = minMetric.operator || '';
      thresholdData.min_status = !!(minMetric.operator && minMetric.value);
    }
  
    if (maxMetric?.enabled) {
      thresholdData.max = Number(maxMetric.value) || null;
      thresholdData.max_opr = maxMetric.operator || '';
      thresholdData.max_status = !!(maxMetric.operator && maxMetric.value);
    }
  
    console.log('Données envoyées:', thresholdData);
  
    // Appeler le service pour créer le threshold
    this.thresholdService.createThreshold(thresholdData).subscribe({
      next: () => {
        console.log('Threshold créé avec succès');
        this.loadThresholds();
        this.showPopup = false;
        this.resetForm();
      },
      error: (err) => {
        console.error('Erreur lors de la création du threshold', err);
      }
    });
  }
  

  // Réinitialiser le formulaire après création
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
