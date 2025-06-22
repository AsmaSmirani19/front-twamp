import { Component, OnInit } from '@angular/core';
import { LegendItem, ChartType } from '../lbd/lbd-chart/lbd-chart.component';
import { TestService, TestStats, AgentStatus } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public emailChartType: ChartType = ChartType.Pie;
  public emailChartData: any = { labels: [], series: [] };
  public emailChartLegendItems: LegendItem[] = [];

  public testTypeChartType: ChartType = ChartType.Bar;
  public testTypeChartData: any = { labels: [], series: [] };
  public testTypeChartLegendItems: LegendItem[] = [];
  public testTypeChartOptions: any = {};
  public emailChartColors = ['#a1b5d8', '#c8f2dc'];

  public testsTotal = 0;
  public testsSuccess = 0;
  public testsFailed = 0;
  public successPercent = 0;
  public failedPercent = 0;
  public typedTestsTotal = 0;

  public agentStatuses: AgentStatus[] = [];

  constructor(private testService: TestService) {}

  ngOnInit() {
    console.log('[INIT] ngOnInit démarré');

    // 📊 Statistiques des tests
    this.testService.getTestStats().subscribe({
      next: (stats: TestStats) => {
        console.log('[DATA] Statistiques récupérées depuis le service :', stats);

        this.testsTotal = stats.total;
        this.testsSuccess = stats.success;
        this.testsFailed = stats.failed;

        if (this.testsTotal > 0) {
          this.successPercent = Math.round((this.testsSuccess / this.testsTotal) * 100);
          this.failedPercent = 100 - this.successPercent;
        } else {
          console.warn('[WARN] Nombre total de tests est 0 — Aucun graphique à afficher');
        }

        this.emailChartData = {
          labels: [this.successPercent + '%', this.failedPercent + '%'],
          series: [this.testsSuccess, this.testsFailed]
        };

        console.log('[DEBUG] emailChartData:', this.emailChartData);

        this.emailChartLegendItems = [
          { title: 'Réussis', imageClass: 'fa fa-circle text-success' },
          { title: 'Échoués', imageClass: 'fa fa-circle text-danger' }
        ];

        const typeLabels: string[] = [];
        const typeSeries: number[] = [];

        if (stats.tests_by_type) {
          for (const t of stats.tests_by_type) {
            const label = t.test_type === 'planned_test'
              ? 'Test Plan'
              : t.test_type === 'quick_test'
              ? 'Test Rapide'
              : t.test_type;

            typeLabels.push(label);
            typeSeries.push(Number(t.total || 0));
          }
        }

        console.log('[DEBUG] testType labels:', typeLabels);
        console.log('[DEBUG] testType series:', typeSeries);

        this.testTypeChartData = {
          labels: typeLabels,
          series: [typeSeries] // ✅ format correct = tableau de tableaux
        };

        this.testTypeChartOptions = {
          axisY: {
            onlyInteger: true,
            offset: 20
          }
        };

        this.testTypeChartLegendItems = [
          { title: 'Test Plan', imageClass: 'fa fa-square text-primary' },
          { title: 'Test Rapide', imageClass: 'fa fa-square text-warning' }
        ];

        console.log('[DEBUG] testTypeChartData:', this.testTypeChartData);
        console.log('[DEBUG] testTypeChartLegendItems:', this.testTypeChartLegendItems);
      },
      error: (error) => {
        console.error('[ERROR] Erreur lors de la récupération des stats :', error);
      }
    });

    // 📡 Statuts des agents
    this.testService.getAgentStatuses().subscribe({
      next: (statuses: AgentStatus[]) => {
        console.log('[DATA] Statuts agents récupérés (brut) :', statuses);

        this.agentStatuses = statuses.map(agent => ({
          ...agent,
          status: agent.test_health ? 'active' : 'inactive'
        }));

        console.log('[DEBUG] Statuts agents normalisés :', this.agentStatuses);
      },
      error: (err) => {
        console.error('[ERROR] Erreur récupération statuts agents :', err);
      }
    });
  }

  getClass(item: any): string {
    return item?.imageClass?.trim?.() || '';
  }

  getActiveCount(): number {
    return this.agentStatuses.filter(agent => agent.status === 'active').length;
  }

  getInactiveCount(): number {
    return this.agentStatuses.filter(agent => agent.status === 'inactive').length;
  }

  isValidClass(className: any): boolean {
    return typeof className === 'string' && className.trim() !== '';
  }
}
