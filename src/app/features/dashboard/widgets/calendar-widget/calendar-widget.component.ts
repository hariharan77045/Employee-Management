import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { toDateKey } from '../../../../core/utils/date.utils';
import { IconComponent } from '../../../../shared/icon.component';

interface CalendarDay {
  key: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
}

@Component({
  selector: 'app-calendar-widget',
  standalone: true,
  imports: [DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-widget.component.html',
  styleUrl: './calendar-widget.component.scss',
})
export class CalendarWidgetComponent {
  readonly eventDates = input<string[]>([]);

  protected readonly weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  /** First day of the month being shown. */
  readonly month = signal(this.startOfMonth(new Date()));

  readonly days = computed<CalendarDay[]>(() => {
    const month = this.month();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const leadingDays = month.getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7;
    const today = toDateKey(new Date());
    const events = new Set(this.eventDates());

    return Array.from({ length: cellCount }, (_, index) => {
      const date = new Date(year, monthIndex, index - leadingDays + 1);
      const key = toDateKey(date);
      return {
        key,
        day: date.getDate(),
        inMonth: date.getMonth() === monthIndex,
        isToday: key === today,
        hasEvent: events.has(key),
      };
    });
  });

  changeMonth(offset: number): void {
    this.month.update((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
