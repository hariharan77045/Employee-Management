import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CurrentUser, Role } from '../../core/models/dashboard.models';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';

const ROLE_LABELS: Record<Role, string> = { ADMIN: 'Admin', HR: 'HR', MANAGER: 'Manager', EMPLOYEE: 'Employee' };

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, AvatarComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  private readonly router = inject(Router);

  readonly user = input<CurrentUser>();
  readonly menuClicked = output<void>();
  readonly logoutClicked = output<void>();

  protected readonly menuOpen = signal(false);

  protected roleLabel(role: Role): string {
    return ROLE_LABELS[role] ?? role;
  }

  /** Sends the query to the directory page, which reads it from ?q=. */
  protected search(value: string): void {
    this.router.navigate(['/directory'], { queryParams: { q: value.trim() } });
  }
}
