import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Announcement } from '../../../../core/models/dashboard.models';
import { AvatarComponent } from '../../../../shared/avatar.component';

@Component({
  selector: 'app-feature-widget',
  standalone: true,
  imports: [DatePipe, RouterLink, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './feature-widget.component.html',
  styleUrl: './feature-widget.component.scss',
})
export class FeatureWidgetComponent {
  readonly announcements = input.required<Announcement[]>();
}
