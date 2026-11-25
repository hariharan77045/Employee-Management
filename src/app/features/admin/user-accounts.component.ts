import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { Role, UserAccount } from '../../core/models/dashboard.models';
import { AdminService } from '../../core/services/admin.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import { IconComponent } from '../../shared/icon.component';

/** ADMIN-only page: roles, enable/disable, unlock and password resets for every login. */
@Component({
  selector: 'app-user-accounts',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-accounts.component.html',
  styles: `
    .filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
    .filters input { flex: 1 1 220px; }
    .filters input, select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; font: inherit; background: var(--surface); color: var(--text); }
    .actions { display: flex; flex-wrap: wrap; gap: 6px; }
    .user small { display: block; color: var(--muted); overflow-wrap: anywhere; }
    .temp { font-family: ui-monospace, Consolas, monospace; font-weight: 700; user-select: all; }
  `,
})
export class UserAccountsComponent {
  private readonly admin = inject(AdminService);
  protected readonly me = inject(AuthService).user;

  protected readonly roles: Role[] = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
  protected readonly accounts = signal<UserAccount[] | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly tempPassword = signal<{ name: string; password: string } | null>(null);
  protected readonly busyId = signal<number | null>(null);
  protected readonly query = signal('');
  protected readonly roleFilter = signal<Role | ''>('');

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const role = this.roleFilter();
    return (this.accounts() ?? []).filter(
      (a) =>
        (!role || a.role === role) &&
        (!q || a.employeeName.toLowerCase().includes(q) || a.username.includes(q)),
    );
  });

  protected readonly counts = computed(() => {
    const rows = this.accounts() ?? [];
    return { total: rows.length, disabled: rows.filter((a) => !a.enabled).length, locked: rows.filter((a) => a.locked).length };
  });

  constructor() {
    this.admin.users().subscribe({
      next: (rows) => this.accounts.set(rows),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected isMe(a: UserAccount): boolean {
    return a.employeeId === this.me()?.id;
  }

  protected setRole(a: UserAccount, role: string): void {
    this.save(a, role as Role, a.enabled);
  }

  protected toggleEnabled(a: UserAccount): void {
    if (a.enabled && !confirm(`Disable ${a.employeeName}'s account? They'll be signed out straight away.`)) {
      return;
    }
    this.save(a, a.role, !a.enabled);
  }

  protected unlock(a: UserAccount): void {
    this.run(a, this.admin.unlock(a.id), () => this.notice.set(`${a.employeeName}'s account is unlocked.`));
  }

  protected resetPassword(a: UserAccount): void {
    if (!confirm(`Reset ${a.employeeName}'s password? They'll be signed out and need the new temporary password.`)) {
      return;
    }
    this.busyId.set(a.id);
    this.error.set(null);
    this.tempPassword.set(null);
    this.admin.resetPassword(a.id).subscribe({
      next: ({ temporaryPassword }) => {
        this.busyId.set(null);
        this.notice.set(null);
        this.tempPassword.set({ name: a.employeeName, password: temporaryPassword });
        this.replace({ ...a, locked: false });
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  private save(a: UserAccount, role: Role, enabled: boolean): void {
    this.run(a, this.admin.update(a.id, role, enabled), () => this.notice.set(`Saved ${a.employeeName}.`));
  }

  private run(a: UserAccount, call: ReturnType<AdminService['unlock']>, done: () => void): void {
    this.busyId.set(a.id);
    this.error.set(null);
    this.notice.set(null);
    this.tempPassword.set(null);
    call.subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.replace(updated);
        done();
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(apiErrorMessage(err));
        // Put the select back to the saved value.
        this.accounts.update((rows) => (rows ? [...rows] : rows));
      },
    });
  }

  private replace(updated: UserAccount): void {
    this.accounts.update((rows) => (rows ?? []).map((r) => (r.id === updated.id ? updated : r)));
  }
}
