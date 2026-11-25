import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Leave, LeaveStatus, Payslip } from '../../core/models/employee.models';
import { AuthService } from '../../core/auth/auth.service';
import { LeaveService } from '../../core/services/leave.service';
import { apiErrorMessage, applyServerErrors } from '../../core/utils/api-error';
import { toDateKey } from '../../core/utils/date.utils';
import { IconComponent } from '../../shared/icon.component';

type Tab = 'time-off' | 'approvals' | 'payslips';

function dateRangeValidator(group: AbstractControl): ValidationErrors | null {
  const from = group.get('fromDate')?.value;
  const to = group.get('toDate')?.value;
  return from && to && to < from ? { range: true } : null;
}

@Component({
  selector: 'app-my-services',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-services.component.html',
  styleUrl: './my-services.component.scss',
})
export class MyServicesComponent {
  private readonly leaves = inject(LeaveService);
  private readonly fb = inject(FormBuilder).nonNullable;

  /** Route parameter: /my-services/:tab. */
  readonly tab = input<string>();
  protected readonly activeTab = computed<Tab>(() => {
    const tab = this.tab();
    if (tab === 'approvals') {
      return this.canApprove() ? tab : 'time-off';
    }
    return tab === 'payslips' ? tab : 'time-off';
  });

  protected readonly today = toDateKey(new Date());
  protected readonly leaveTypes = toSignal(this.leaves.types(), { initialValue: [] });

  // --- Time off -----------------------------------------------------------
  protected readonly myLeaves = signal<Leave[] | null>(null);
  protected readonly myLeavesError = signal<string | null>(null);
  protected readonly applying = signal(false);
  protected readonly applyError = signal<string | null>(null);
  protected readonly applySuccess = signal<string | null>(null);

  protected readonly leaveForm = this.fb.group(
    {
      leaveType: ['', Validators.required],
      fromDate: [this.today, Validators.required],
      toDate: [this.today, Validators.required],
      reason: ['', Validators.maxLength(500)],
    },
    { validators: dateRangeValidator },
  );

  protected readonly leaveSummary = computed(() => {
    const rows = this.myLeaves() ?? [];
    const count = (status: LeaveStatus) => rows.filter((l) => l.status === status).length;
    const approvedDays = rows.filter((l) => l.status === 'Approved').reduce((sum, l) => sum + l.days, 0);
    return { pending: count('Pending'), approved: count('Approved'), rejected: count('Rejected'), approvedDays };
  });

  // --- Approvals ----------------------------------------------------------
  protected readonly approvalFilter = signal<LeaveStatus>('Pending');
  protected readonly approvals = signal<Leave[] | null>(null);
  protected readonly approvalsError = signal<string | null>(null);
  protected readonly busyId = signal<number | null>(null);

  private readonly auth = inject(AuthService);
  protected readonly currentUser = this.auth.user;
  /** Managers, HR and admins decide leave; the API enforces the same rule. */
  protected readonly canApprove = computed(() => !!this.currentUser() && this.auth.hasRole('ADMIN', 'HR', 'MANAGER'));

  // --- Payslips -----------------------------------------------------------
  protected readonly payslips = toSignal<Payslip[] | null>(this.leaves.myPayslips(), { initialValue: null });

  constructor() {
    this.loadMyLeaves();
    if (this.canApprove()) {
      this.loadApprovals();
    }
  }

  protected badgeClass(status: string): string {
    return 'badge ' + status.replace(/\s+/g, '-');
  }

  protected loadMyLeaves(): void {
    this.leaves.myLeaves().subscribe({
      next: (rows) => {
        this.myLeaves.set(rows);
        this.myLeavesError.set(null);
      },
      error: (err) => this.myLeavesError.set(apiErrorMessage(err)),
    });
  }

  protected applyLeave(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }
    this.applying.set(true);
    this.applyError.set(null);
    this.applySuccess.set(null);

    this.leaves.apply(this.leaveForm.getRawValue()).subscribe({
      next: (leave) => {
        this.applying.set(false);
        this.applySuccess.set(`${leave.leaveType} request for ${leave.days} day(s) submitted for approval.`);
        this.leaveForm.reset({ leaveType: '', fromDate: this.today, toDate: this.today, reason: '' });
        this.myLeaves.update((rows) => [leave, ...(rows ?? [])]);
      },
      error: (err) => {
        this.applying.set(false);
        this.applyError.set(apiErrorMessage(err));
        applyServerErrors(this.leaveForm, err);
      },
    });
  }

  protected withdraw(leave: Leave): void {
    if (!confirm(`Withdraw your ${leave.leaveType.toLowerCase()} request?`)) {
      return;
    }
    this.busyId.set(leave.id);
    this.leaves.withdraw(leave.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.myLeaves.update((rows) => (rows ?? []).filter((l) => l.id !== leave.id));
      },
      error: (err) => {
        this.busyId.set(null);
        this.myLeavesError.set(apiErrorMessage(err));
      },
    });
  }

  protected setApprovalFilter(status: LeaveStatus): void {
    this.approvalFilter.set(status);
    this.loadApprovals();
  }

  protected loadApprovals(): void {
    this.approvals.set(null);
    this.leaves.list(this.approvalFilter()).subscribe({
      next: (rows) => {
        this.approvals.set(rows);
        this.approvalsError.set(null);
      },
      error: (err) => this.approvalsError.set(apiErrorMessage(err)),
    });
  }

  protected decide(leave: Leave, status: 'Approved' | 'Rejected'): void {
    this.busyId.set(leave.id);
    this.approvalsError.set(null);
    this.leaves.setStatus(leave.id, status).subscribe({
      next: () => {
        this.busyId.set(null);
        // It no longer matches the "Pending" filter, so drop it from the list.
        this.approvals.update((rows) => (rows ?? []).filter((l) => l.id !== leave.id));
      },
      error: (err) => {
        this.busyId.set(null);
        this.approvalsError.set(apiErrorMessage(err));
      },
    });
  }
}
