import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

import { EmployeeDetail } from '../../../core/models/employee.models';
import { AuthService } from '../../../core/auth/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { apiErrorMessage } from '../../../core/utils/api-error';
import { AvatarComponent } from '../../../shared/avatar.component';
import { IconComponent } from '../../../shared/icon.component';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';

interface DetailState {
  loading: boolean;
  employee: EmployeeDetail | null;
  error: string | null;
}

/** Profile page for /directory/:id and, without an id, for /my-profile. */
@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, AvatarComponent, IconComponent, EmployeeFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent {
  private readonly service = inject(EmployeeService);
  private readonly router = inject(Router);

  /** Route parameter (bound by withComponentInputBinding). Missing on /my-profile. */
  readonly id = input<string>();

  private readonly auth = inject(AuthService);
  private readonly currentUser = this.auth.user;
  /** HR and admins manage records; the API enforces the same rule. */
  protected readonly canManage = computed(() => !!this.currentUser() && this.auth.hasRole('ADMIN', 'HR'));
  /** Managers also see colleagues' leave, reviews and attendance. */
  protected readonly canSeeWork = computed(() => !!this.currentUser() && this.auth.hasRole('ADMIN', 'HR', 'MANAGER'));

  protected readonly isMe = computed(() => !this.id() || Number(this.id()) === this.currentUser()?.id);
  protected readonly editing = signal(false);
  protected readonly deleting = signal(false);
  protected readonly actionError = signal<string | null>(null);

  private readonly targetId = computed(() => {
    const id = this.id();
    return id ? Number(id) : this.currentUser()?.id;
  });

  protected readonly state = toSignal(
    toObservable(this.targetId).pipe(
      switchMap((id) => {
        if (id === undefined) {
          return of<DetailState>({ loading: true, employee: null, error: null });
        }
        if (!Number.isInteger(id)) {
          return of<DetailState>({ loading: false, employee: null, error: 'That employee does not exist.' });
        }
        return this.service.get(id).pipe(
          map((employee): DetailState => ({ loading: false, employee, error: null })),
          catchError((err) => of<DetailState>({ loading: false, employee: null, error: apiErrorMessage(err) })),
          startWith<DetailState>({ loading: true, employee: null, error: null }),
        );
      }),
    ),
    { initialValue: { loading: true, employee: null, error: null } as DetailState },
  );

  /** Shows the server's copy right after an edit, without waiting for a reload. */
  private readonly edited = signal<EmployeeDetail | null>(null);
  protected readonly employee = computed(() => {
    const loaded = this.state().employee;
    const edited = this.edited();
    return edited && loaded && edited.id === loaded.id ? edited : loaded;
  });

  protected readonly averageRating = computed(() => {
    const reviews = this.employee()?.reviews ?? [];
    if (!reviews.length) {
      return null;
    }
    return reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length;
  });

  protected badgeClass(status: string | null): string {
    return 'badge ' + (status ?? '').replace(/\s+/g, '-');
  }

  protected onSaved(employee: EmployeeDetail): void {
    this.edited.set(employee);
    if (this.isMe()) {
      // Keep the name in the sidebar and top bar in step with the edit.
      this.auth.refreshUser();
    }
  }

  protected remove(employee: EmployeeDetail): void {
    const name = `${employee.firstName} ${employee.lastName}`;
    const ok = confirm(
      `Delete ${name}? This also deletes their address, attendance, project assignments, leave, payroll and review records. This can't be undone.`,
    );
    if (!ok) {
      return;
    }
    this.deleting.set(true);
    this.actionError.set(null);
    this.service.delete(employee.id).subscribe({
      next: () => this.router.navigate(['/directory']),
      error: (err) => {
        this.deleting.set(false);
        this.actionError.set(apiErrorMessage(err));
      },
    });
  }
}
