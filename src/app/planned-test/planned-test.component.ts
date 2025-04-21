import { Component, OnInit } from '@angular/core';

interface PlannedTest {
  name: string;
  duration: string;
  numberOfAgents: number;
  createdAt: string;
}

@Component({
  selector: 'app-planned-test',
  templateUrl: './planned-test.component.html',
  styleUrls: ['./planned-test.component.scss']
})
export class PlannedTestComponent implements OnInit {
  tableData: {
    headerRow: string[];
    dataRows: PlannedTest[];
  };

  selectedTest: PlannedTest | null = null;

  ngOnInit(): void {
    this.tableData = {
      headerRow: ['Test Name', 'Test Duration', 'Number of Agents', 'Creation Date', 'Action'],
      dataRows: [
        {
          name: 'Test 1',
          duration: '60s',
          numberOfAgents: 3,
          createdAt: '2025-04-18 10:00:00'
        },
        {
          name: 'Test 2',
          duration: '120s',
          numberOfAgents: 2,
          createdAt: '2025-04-15 09:00:00'
        }
      ]
    };
  }

  onNewPlannedTest(): void {
    console.log('New Planned Test button clicked');
    // open a modal, navigate or show form
  }

  onView(row: PlannedTest): void {
    this.selectedTest = row;
  }

  closePopup(): void {
    this.selectedTest = null;
  }

  onDelete(row: PlannedTest): void {
    const index = this.tableData.dataRows.indexOf(row);
    if (index !== -1) {
      this.tableData.dataRows.splice(index, 1);
    }
  }
}
