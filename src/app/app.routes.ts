import { Routes } from '@angular/router';

import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { ChangePasswordComponent } from './features/account/change-password.component';
import { UserAccountsComponent } from './features/admin/user-accounts.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DirectoryComponent } from './features/directory/directory.component';
import { EmployeeDetailComponent } from './features/directory/employee-detail/employee-detail.component';
import { DocumentsComponent } from './features/documents/documents.component';
import { HelpComponent } from './features/help/help.component';
import { LibraryComponent } from './features/library/library.component';
import { LoginComponent } from './features/login/login.component';
import { MyServicesComponent } from './features/my-services/my-services.component';
import { NewsEventsComponent } from './features/news-events/news-events.component';
import { TasksComponent } from './features/tasks/tasks.component';
import { ShellComponent } from './layout/shell/shell.component';

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
      { path: 'documents', title: 'Documents | EmployeeHub', component: DocumentsComponent },
      { path: 'directory', title: 'Directory | EmployeeHub', component: DirectoryComponent },
      { path: 'directory/:id', title: 'Employee | EmployeeHub', component: EmployeeDetailComponent },
      { path: 'news-events', title: 'News & events | EmployeeHub', component: NewsEventsComponent },
      { path: 'tasks', title: 'Tasks | EmployeeHub', component: TasksComponent },
      { path: 'library', title: 'Library | EmployeeHub', component: LibraryComponent },
      { path: 'help', title: 'Help & support | EmployeeHub', component: HelpComponent },
      { path: 'account/password', title: 'Change password | EmployeeHub', component: ChangePasswordComponent },
      {
        path: 'admin/users',
        title: 'User accounts | EmployeeHub',
        component: UserAccountsComponent,
        canActivate: [roleGuard('ADMIN')],
      },
      { path: '**', redirectTo: 'home' },
    ],
  },
];
