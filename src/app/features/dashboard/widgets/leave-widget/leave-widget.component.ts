import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { LeaveEntry } from '../../../../core/models/dashboard.models';
import { AvatarComponent } from '../../../../shared/avatar.component';

@Component({
  selector: 'app-leave-widget',
  standalone: true,
  imports: [DatePipe, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card card-pad">
      <div class="card-head">
        <h2>Who's off</h2>
      </div>
      <ul class="rows">
        @for (leave of leaves(); track leave.id) {
          <li class="row">
            <app-avatar [name]="leave.employeeName" />
            <span class="row-text">
              <strong>{{ leave.employeeName }}</strong>
              <small>
                {{ leave.fromDate | date: 'MMM d' }}
                @if (leave.toDate !== leave.fromDate) {
                  – {{ leave.toDate | date: 'MMM d' }}
                }
                · {{ leave.leaveType }}
              </small>
            </span>
          </li>
        } @empty {
          <li class="row"><small>No approved leave in the next two weeks.</small></li>
        }
      </ul>
    </section>
  `,
  styles: `:host { display: block; height: 100%; }`,
})
export class LeaveWidgetComponent {
  readonly leaves = input.required<LeaveEntry[]>();
}
