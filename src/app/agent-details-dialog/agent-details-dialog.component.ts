import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-agent-details-dialog',
  templateUrl: './agent-details-dialog.component.html',
  styleUrls: ['./agent-details-dialog.component.scss']
})
export class AgentDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
