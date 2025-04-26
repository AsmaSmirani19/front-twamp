import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-result',
  templateUrl: './test-result.component.html',
  styleUrls: ['./test-result.component.scss']
})
export class TestResultComponent implements OnInit {

  // Tableau contenant les résultats des tests
  testResults = [
    {
      planning: 'Test Plan A',
      name: 'QoS Check',
      type: 'Ping',
      status: 'Completed',
      startedAt: '2025-04-23 10:00',
      agent: 'Agent 1',
      group: 'Group A',
      duration: '60s',
      target: 'Target A',
      minValue: '20ms',
      maxValue: '100ms',
      avgValue: '50ms',
      successRate: '95%',
      thresholdName: 'Latency Threshold',
      thresholdValue: '50ms'
    },
    {
      planning: 'Test Plan B',
      name: 'Latency Test',
      type: 'HTTP',
      status: 'Running',
      startedAt: '2025-04-23 11:00',
      agent: 'Agent 2',
      group: 'Group B',
      duration: '120s',
      target: 'Target B',
      minValue: '30ms',
      maxValue: '110ms',
      avgValue: '60ms',
      successRate: '90%',
      thresholdName: 'Latency Threshold',
      thresholdValue: '60ms'
    }
  ];

  // Variable pour afficher le popup de détails
  selectedResult: any = null;

  constructor() {}

  ngOnInit(): void {}

  // Fonction pour afficher le popup avec les détails du test
  onView(result: any): void {
    this.selectedResult = result;  // Sélectionne le test à afficher dans le popup
  }

  // Fonction pour supprimer un test
  onDelete(result: any): void {
    const index = this.testResults.indexOf(result);
    if (index !== -1) {
      this.testResults.splice(index, 1);
    }
  }

  // Fonction pour fermer le popup
  closePopup(): void {
    this.selectedResult = null;
  }

}
