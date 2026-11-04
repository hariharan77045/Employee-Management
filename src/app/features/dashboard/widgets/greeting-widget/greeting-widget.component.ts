import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Weather } from '../../../../core/models/dashboard.models';

@Component({
  selector: 'app-greeting-widget',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './greeting-widget.component.html',
  styleUrl: './greeting-widget.component.scss',
})
export class GreetingWidgetComponent {
  readonly firstName = input.required<string>();
  readonly weather = input.required<Weather>();
  readonly tip = input.required<string>();

  protected readonly now = new Date();
  protected readonly greeting = this.getGreeting(this.now.getHours());

  private getGreeting(hour: number): string {
    if (hour < 12) return 'Good morning';
    return hour < 17 ? 'Good afternoon' : 'Good evening';
  }
}
