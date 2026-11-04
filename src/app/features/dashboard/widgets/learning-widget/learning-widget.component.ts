import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Course } from '../../../../core/models/dashboard.models';
import { IconComponent } from '../../../../shared/icon.component';

@Component({
  selector: 'app-learning-widget',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card card-pad">
      <div class="card-head">
        <h2>Learning</h2>
        <a class="link" routerLink="/library">View all</a>
      </div>
      <ul class="rows">
        @for (course of courses(); track course.id) {
          <li>
            <a class="row" routerLink="/library">
              <span class="tile"><app-icon [name]="course.icon" /></span>
              <span class="row-text">
                <strong>{{ course.title }}</strong>
                <small>Duration: {{ course.durationMonths }} {{ course.durationMonths === 1 ? 'month' : 'months' }}</small>
              </span>
              <app-icon name="chevron-right" />
            </a>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `:host { display: block; height: 100%; }`,
})
export class LearningWidgetComponent {
  readonly courses = input.required<Course[]>();
}
