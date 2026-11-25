import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { ChangePasswordComponent } from './features/account/change-password.component';
import { UserAccountsComponent } from './features/admin/user-accounts.component';
import { ComingSoonComponent } from './features/coming-soon/coming-soon.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DirectoryComponent } from './features/directory/directory.component';
import { EmployeeDetailComponent } from './features/directory/employee-detail/employee-detail.component';
import { LoginComponent } from './features/login/login.component';
import { MyServicesComponent } from './features/my-services/my-services.component';
import { NewsEventsComponent } from './features/news-events/news-events.component';
import { NAV_ITEMS } from './layout/nav-items';
import { ShellComponent } from './layout/shell/shell.component';

/** Sections that have a real page; every other nav item shows "coming soon". */
const BUILT = new Set(['home', 'my-profile', 'my-services', 'directory', 'news-events', 'admin/users']);

export const routes: Routes = [
  { path: 'login', title: 'Sign in | EmployeeHub', component: LoginComponent, canActivate: [guestGuard] },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', title: 'Home | EmployeeHub', component: DashboardComponent },
      { path: 'my-profile', title: 'My profile | EmployeeHub', component: EmployeeDetailComponent },
      { path: 'my-services', title: 'My services | EmployeeHub', component: MyServicesComponent },
      { path: 'my-services/:tab', title: 'My services | EmployeeHub', component: MyServicesComponent },
      { path: 'directory', title: 'Directory | EmployeeHub', component: DirectoryComponent },
      { path: 'directory/:id', title: 'Employee | EmployeeHub', component: EmployeeDetailComponent },
      { path: 'news-events', title: 'News & events | EmployeeHub', component: NewsEventsComponent },
      { path: 'account/password', title: 'Change password | EmployeeHub', component: ChangePasswordComponent },
      {
        path: 'admin/users',
        title: 'User accounts | EmployeeHub',
        component: UserAccountsComponent,
        canActivate: [roleGuard('ADMIN')],
      },
      ...NAV_ITEMS.filter((item) => !BUILT.has(item.path)).map((item) => ({
        path: item.path,
        title: `${item.label} | EmployeeHub`,
        data: { label: item.label },
        component: ComingSoonComponent,
      })),
      { path: '**', redirectTo: 'home' },
    ],
  },
];
