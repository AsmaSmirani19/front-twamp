import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-threshold',
  templateUrl: './threshold.component.html',
  styleUrls: ['./threshold.component.scss']
})
export class ThresholdComponent implements OnInit {
  thresholds = [
    {
      profileName: 'Default Profile',
      creationDate: '2025-04-22',
      activeThreshold: 5,
      disabledThreshold: 2
    },
    {
      profileName: 'High Sensitivity',
      creationDate: '2025-04-21',
      activeThreshold: 3,
      disabledThreshold: 1
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  onView(profile: any): void {
    console.log('View threshold:', profile);
    // Tu peux afficher une popup ici
  }

  onDelete(profile: any): void {
    const index = this.thresholds.indexOf(profile);
    if (index !== -1) {
      this.thresholds.splice(index, 1);
    }
  }
  showPopup = false;

newThreshold = {
  name: ''
};

thresholdMetrics = [
  { label: 'Min Value', operator: '', value: '', enabled: true },
  { label: 'Max Value', operator: '', value: '', enabled: true },
  { label: 'Avg Value', operator: '', value: '', enabled: true }
];

createThreshold() {
  console.log('Threshold created:', this.newThreshold, this.thresholdMetrics);
  this.showPopup = false;
}

}
