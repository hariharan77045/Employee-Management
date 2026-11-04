import { Routes } from '@angular/router';

import { ComingSoonComponent } from './features/coming-soon/coming-soon.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NAV_ITEMS } from './layout/nav-items';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', title: 'Home | EmployeeHub', component: DashboardComponent },
      ...NAV_ITEMS.filter((item) => item.path !== 'home').map((item) => ({
        path: item.path,
        title: `${item.label} | EmployeeHub`,
        data: { label: item.label },
        component: ComingSoonComponent,
      })),
      { path: '**', redirectTo: 'home' },
    ],
  },
];
