import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from '@angular/core';
import * as Chartist from 'chartist';

export interface LegendItem {
  title: string;
  imageClass: string;
}

export enum ChartType {
  Pie = 'pie',
  Line = 'line',
  Bar = 'bar'
}

@Component({
  selector: 'lbd-chart',
  templateUrl: './lbd-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LbdChartComponent implements OnInit, OnChanges {
  static currentId = 1;

  @Input() public title: string;
  @Input() public subtitle: string;
  @Input() public chartClass: string;
  @Input() public chartType: ChartType;
  @Input() public chartData: any;
  @Input() public chartOptions: any;
  @Input() public chartResponsive: any[];
  @Input() public footerIconClass: string;
  @Input() public footerText: string;
  @Input() public legendItems: LegendItem[];
  @Input() public withHr: boolean;
  @Input() public colors: string[] = [];


  public chartId: string;

  constructor() {}

  public ngOnInit(): void {
    this.chartId = `lbd-chart-${LbdChartComponent.currentId++}`;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.chartData && this.chartData.series && this.chartData.series.length > 0) {
      this.renderChart();
    }
  }

 private renderChart(): void {
  const chartSelector = `#${this.chartId}`;

  // Injecter un style dynamique avec les couleurs passées en input
  if (this.colors && this.colors.length > 0) {
    this.injectColorsStyle(this.colors, this.chartId);
  }

  switch (this.chartType) {
    case ChartType.Pie:
      new Chartist.Pie(chartSelector, this.chartData, this.chartOptions, this.chartResponsive);
      break;
    case ChartType.Line:
      new Chartist.Line(chartSelector, this.chartData, this.chartOptions, this.chartResponsive);
      break;
    case ChartType.Bar:
      new Chartist.Bar(chartSelector, this.chartData, this.chartOptions, this.chartResponsive);
      break;
  }
}

isValidClass(className: any): boolean {
  return typeof className === 'string' && className.trim() !== '';
}

/**
 * Injecte un style CSS avec les couleurs personnalisées pour ce graphique
 */
private injectColorsStyle(colors: string[], chartId: string): void {
  const styleId = `chart-colors-style-${chartId}`;
  if (document.getElementById(styleId)) {
    // Style déjà injecté, on ne fait rien
    return;
  }
  const style = document.createElement('style');
  style.id = styleId;

  let css = '';
  colors.forEach((color, index) => {
    css += `#${chartId} .ct-series-${String.fromCharCode(97 + index)} .ct-slice-donut, ` + 
           `#${chartId} .ct-series-${String.fromCharCode(97 + index)} path { stroke: ${color} !important; fill: ${color} !important; }\n`;
  });

  style.innerHTML = css;
  document.head.appendChild(style);
}

}
