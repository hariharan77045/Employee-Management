import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CompanyEvent } from '../../../../core/models/dashboard.models';
import { IconComponent } from '../../../../shared/icon.component';

@Component({
  selector: 'app-events-widget',
  standalone: true,
  imports: [DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card card-pad">
      <div class="card-head">
        <h2>Upcoming events</h2>
      </div>
      <ul class="rows">
        @for (event of events(); track event.id) {
          <li class="row">
            <span class="tile"><app-icon name="calendar" /></span>
            <span class="row-text">
              <strong>{{ event.title }}</strong>
              <small>{{ event.date | date: 'MMMM d, y' }}</small>
            </span>
          </li>
        } @empty {
          <li class="row"><small>No upcoming events.</small></li>
        }
      </ul>
    </section>
  `,
  styles: `:host { display: block; height: 100%; }`,
})
export class EventsWidgetComponent {
  readonly events = input.required<CompanyEvent[]>();
}
