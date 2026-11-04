import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ServiceLink } from '../../../../core/models/dashboard.models';
import { IconComponent } from '../../../../shared/icon.component';

@Component({
  selector: 'app-services-widget',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card card-pad">
      <div class="card-head">
        <h2>Services</h2>
        <a class="link" routerLink="/my-services">View all</a>
      </div>
      <ul class="rows">
        @for (service of services(); track service.id) {
          <li class="row">
            <span class="tile"><app-icon [name]="service.icon" /></span>
            <span class="row-text">
              <strong>{{ service.title }}</strong>
              <small>{{ service.description }}</small>
            </span>
            <a class="link" [routerLink]="service.route" [attr.aria-label]="'View ' + service.title">View</a>
          </li>
        }
      </ul>
    </section>
  `,
  styles: `:host { display: block; height: 100%; }`,
})
export class ServicesWidgetComponent {
  readonly services = input.required<ServiceLink[]>();
}
