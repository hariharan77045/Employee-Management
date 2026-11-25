import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { Faq, LABELS, Priority, Ticket, TicketCategory, TicketStatus } from '../../core/models/portal.models';
import { SupportService } from '../../core/services/portal.services';
import { apiErrorMessage, applyServerErrors } from '../../core/utils/api-error';
import { IconComponent } from '../../shared/icon.component';

type Tab = 'faq' | 'mine' | 'queue';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpComponent {
  private readonly service = inject(SupportService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly labels = LABELS;
  protected readonly categories: TicketCategory[] = ['IT', 'HR', 'PAYROLL', 'FACILITIES', 'OTHER'];
  protected readonly priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];
  protected readonly statuses: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  /** HR and admins work the support queue; the API enforces the same rule. */
  protected readonly canWorkQueue = computed(() => !!this.auth.user() && this.auth.hasRole('ADMIN', 'HR'));

  protected readonly tab = signal<Tab>('faq');
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly busyId = signal<number | null>(null);

  // --- FAQ ---------------------------------------------------------------------
  private readonly faqs = toSignal(
    this.service.faqs().pipe(
      catchError((err) => {
        this.error.set(apiErrorMessage(err));
        return of([] as Faq[]);
      }),
    ),
  );
  protected readonly faqQuery = signal('');
  protected readonly faqGroups = computed(() => {
    const q = this.faqQuery().trim().toLowerCase();
    const groups = new Map<string, Faq[]>();
    for (const f of this.faqs() ?? []) {
      if (!q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)) {
        groups.set(f.category, [...(groups.get(f.category) ?? []), f]);
      }
    }
    return [...groups.entries()].map(([category, items]) => ({ category, items }));
  });
  protected readonly faqsLoaded = computed(() => this.faqs() !== undefined);

  // --- My tickets ----------------------------------------------------------------
  protected readonly myTickets = signal<Ticket[] | null>(null);
  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly form = this.fb.group({
    category: ['IT' as TicketCategory, Validators.required],
    priority: ['MEDIUM' as Priority, Validators.required],
    subject: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  // --- Queue (HR/admin) ----------------------------------------------------------
  protected readonly queueFilter = signal<TicketStatus | ''>('OPEN');
  protected readonly queue = signal<Ticket[] | null>(null);
  /** Unsaved edits per ticket in the queue. */
  protected readonly drafts = signal<Partial<Record<number, { status: TicketStatus; resolution: string }>>>({});

  constructor() {
    this.loadMine();
  }

  protected setTab(tab: Tab): void {
    this.tab.set(tab);
    this.notice.set(null);
    if (tab === 'queue' && this.queue() === null) {
      this.loadQueue();
    }
  }

  private loadMine(): void {
    this.service.myTickets().subscribe({
      next: (rows) => this.myTickets.set(rows),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected loadQueue(): void {
    this.queue.set(null);
    this.service.queue(this.queueFilter()).subscribe({
      next: (rows) => {
        this.queue.set(rows);
        this.drafts.set(
          Object.fromEntries(rows.map((t) => [t.id, { status: t.status, resolution: t.resolution ?? '' }])),
        );
      },
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected setQueueFilter(value: string): void {
    this.queueFilter.set(value as TicketStatus | '');
    this.loadQueue();
  }

  protected badge(status: TicketStatus): string {
    return { OPEN: 'badge Pending', IN_PROGRESS: 'badge Work-From-Home', RESOLVED: 'badge Approved', CLOSED: 'badge' }[status];
  }

  protected raise(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    this.service.raise(this.form.getRawValue()).subscribe({
      next: (ticket) => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ category: 'IT', priority: 'MEDIUM' });
        this.myTickets.update((rows) => [ticket, ...(rows ?? [])]);
        this.notice.set(`Ticket #${ticket.id} raised. You'll see updates here.`);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(apiErrorMessage(err));
        applyServerErrors(this.form, err);
      },
    });
  }

  protected close(ticket: Ticket): void {
    this.busyId.set(ticket.id);
    this.service.close(ticket.id).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.myTickets.update((rows) => (rows ?? []).map((t) => (t.id === updated.id ? updated : t)));
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected editDraft(id: number, change: Partial<{ status: TicketStatus; resolution: string }>): void {
    this.drafts.update((d) => {
      const current = d[id] ?? { status: 'OPEN' as TicketStatus, resolution: '' };
      return { ...d, [id]: { ...current, ...change } };
    });
  }

  protected save(ticket: Ticket): void {
    const draft = this.drafts()[ticket.id] ?? { status: ticket.status, resolution: ticket.resolution ?? '' };
    this.busyId.set(ticket.id);
    this.error.set(null);
    this.service.update(ticket.id, draft.status, draft.resolution).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.queue.update((rows) => (rows ?? []).map((t) => (t.id === updated.id ? updated : t)));
        this.notice.set(`Ticket #${updated.id} updated.`);
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }
}
