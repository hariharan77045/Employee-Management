import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { DashboardData } from '../../core/models/dashboard.models';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import { IconComponent } from '../../shared/icon.component';
import { CalendarWidgetComponent } from './widgets/calendar-widget/calendar-widget.component';
import { ContactsWidgetComponent } from './widgets/contacts-widget/contacts-widget.component';
import { EventsWidgetComponent } from './widgets/events-widget/events-widget.component';
import { FeatureWidgetComponent } from './widgets/feature-widget/feature-widget.component';
import { GreetingWidgetComponent } from './widgets/greeting-widget/greeting-widget.component';
import { LearningWidgetComponent } from './widgets/learning-widget/learning-widget.component';
import { LeaveWidgetComponent } from './widgets/leave-widget/leave-widget.component';
import { ServicesWidgetComponent } from './widgets/services-widget/services-widget.component';

type DashboardState = { data: DashboardData; error: null } | { data: null; error: string };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    IconComponent,
    CalendarWidgetComponent,
    ContactsWidgetComponent,
    EventsWidgetComponent,
    FeatureWidgetComponent,
    GreetingWidgetComponent,
    LearningWidgetComponent,
    LeaveWidgetComponent,
    ServicesWidgetComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly service = inject(DashboardService);

  private readonly auth = inject(AuthService);
  protected readonly user = this.auth.user;
  protected readonly canApprove = computed(() => !!this.user() && this.auth.hasRole('ADMIN', 'HR', 'MANAGER'));
  protected readonly state = toSignal(
    this.service.getDashboard().pipe(
      map((data): DashboardState => ({ data, error: null })),
      catchError((err) => of<DashboardState>({ data: null, error: apiErrorMessage(err) })),
    ),
  );
  protected readonly eventDates = computed(() => this.state()?.data?.events.map((event) => event.date) ?? []);

  protected reload(): void {
    location.reload();
  }
}
