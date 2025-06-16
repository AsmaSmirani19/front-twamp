import { Component, OnInit } from '@angular/core';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'pe-7s-graph', class: '' },
    { path: '/agent', title: 'Agent List ',  icon:'pe-7s-note2', class: '' },
    { path: '/agent-group', title: 'Agent Group ',  icon:'pe-7s-note2', class: '' },
    { path: '/quick-test', title: 'Quick Test ',  icon:'pe-7s-note2', class: '' },
    { path: '/planned-test', title: 'Planned Test ',  icon:'pe-7s-note2', class: '' },
    { path: '/test-result', title: 'Test Result ',  icon:'pe-7s-note2', class: '' },
    { path: '/test-profile', title: 'Test Profile ',  icon:'pe-7s-note2', class: '' },
    { path: '/threshold', title: 'Threshold ',  icon:'pe-7s-note2', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: any[];

  constructor() { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
