import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // <- pour la navigation (facultatif)

declare interface TableData {
    headerRow: string[];
    dataRows: string[][];
}

@Component({
  selector: 'app-tables',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.css']
})
export class AgentListComponent implements OnInit {
    public tableData1: TableData;


    constructor(private router: Router) {} // <- injection du Router

    ngOnInit() {
        this.tableData1 = {
            headerRow: [ 'Agent Name', 'Adress', 'Test', 'State', 'Action'],
            dataRows: [
                ['1', 'Dakota Rice', 'Niger', 'Oud-Turnhout', ''],
                ['2', 'Minerva Hooper', 'Curaçao', 'Sinaai-Waas', ''],
                ['3', 'Sage Rodriguez', 'Netherlands', 'Baileux', ''],
                ['4', 'Philip Chaney', 'Korea, South', 'Overland Park', ''],
                ['5', 'Doris Greene', 'Malawi', 'Feldkirchen in Kärnten', ''],
                ['6', 'Mason Porter', 'Chile', 'Gloucester', '']
            ]
        };
    }

    // Méthode appelée au clic sur le bouton
    onNewAgent(): void {
        console.log('Bouton New Agent cliqué');
        // Redirection vers une autre route si besoin :
        this.router.navigate(['/add-agent']);
    }
}
