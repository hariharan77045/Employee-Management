import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { DashboardService } from '../../core/services/dashboard.service';
import { CalendarWidgetComponent } from './widgets/calendar-widget/calendar-widget.component';
import { ContactsWidgetComponent } from './widgets/contacts-widget/contacts-widget.component';
import { EventsWidgetComponent } from './widgets/events-widget/events-widget.component';
import { FeatureWidgetComponent } from './widgets/feature-widget/feature-widget.component';
import { GreetingWidgetComponent } from './widgets/greeting-widget/greeting-widget.component';
import { LearningWidgetComponent } from './widgets/learning-widget/learning-widget.component';
import { LeaveWidgetComponent } from './widgets/leave-widget/leave-widget.component';
import { ServicesWidgetComponent } from './widgets/services-widget/services-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
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

  protected readonly user = toSignal(this.service.getCurrentUser());
  protected readonly data = toSignal(this.service.getDashboard());
  protected readonly eventDates = computed(() => this.data()?.events.map((event) => event.date) ?? []);
}
