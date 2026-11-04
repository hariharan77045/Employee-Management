import { TestBed } from '@angular/core/testing';

import { CalendarWidgetComponent } from './calendar-widget.component';

describe('CalendarWidgetComponent', () => {
  function createCalendar(eventDates: string[] = []) {
    const fixture = TestBed.createComponent(CalendarWidgetComponent);
    fixture.componentRef.setInput('eventDates', eventDates);
    return fixture.componentInstance;
  }

  it('fills whole weeks, including days from neighbouring months', () => {
    const calendar = createCalendar();
    calendar.month.set(new Date(2026, 10, 1)); // November 2026 starts on a Sunday

    expect(calendar.days().length).toBe(35);
    expect(calendar.days()[0].key).toBe('2026-11-01');
    expect(calendar.days()[34].inMonth).toBeFalse();
  });

  it('marks the days that have events', () => {
    const calendar = createCalendar(['2026-11-20']);
    calendar.month.set(new Date(2026, 10, 1));

    const marked = calendar.days().filter((day) => day.hasEvent);
    expect(marked.map((day) => day.key)).toEqual(['2026-11-20']);
  });

  it('moves across year boundaries', () => {
    const calendar = createCalendar();
    calendar.month.set(new Date(2026, 11, 1));

    calendar.changeMonth(1);

    expect(calendar.month()).toEqual(new Date(2027, 0, 1));
  });
});
