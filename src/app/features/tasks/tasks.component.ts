import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';
import { LABELS, Priority, Task, TaskStatus } from '../../core/models/portal.models';
import { TaskService } from '../../core/services/portal.services';
import { apiErrorMessage, applyServerErrors } from '../../core/utils/api-error';
import { toDateKey } from '../../core/utils/date.utils';
import { IconComponent } from '../../shared/icon.component';

type View = 'mine' | 'assigned';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To do' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DONE', label: 'Done' },
];
const ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss',
})
export class TasksComponent {
  private readonly service = inject(TaskService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly labels = LABELS;
  protected readonly columns = COLUMNS;
  protected readonly priorities: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];
  protected readonly today = toDateKey(new Date());
  protected readonly me = this.auth.user;
  /** Managers, HR and admins can assign tasks to other people. */
  protected readonly canAssign = computed(() => !!this.me() && this.auth.hasRole('ADMIN', 'HR', 'MANAGER'));

  protected readonly view = signal<View>('mine');
  protected readonly tasks = signal<Task[] | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busyId = signal<number | null>(null);

  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', Validators.maxLength(2000)],
    priority: ['MEDIUM' as Priority, Validators.required],
    dueDate: [''],
    assigneeId: [''],
  });

  protected readonly board = computed(() => {
    const rows = this.tasks() ?? [];
    return COLUMNS.map((c) => ({ ...c, tasks: rows.filter((t) => t.status === c.status) }));
  });

  protected readonly summary = computed(() => {
    const rows = this.tasks() ?? [];
    return {
      open: rows.filter((t) => t.status !== 'DONE').length,
      overdue: rows.filter((t) => t.overdue).length,
      done: rows.filter((t) => t.status === 'DONE').length,
    };
  });

  constructor() {
    this.load();
  }

  protected setView(view: View): void {
    this.view.set(view);
    this.load();
  }

  private load(): void {
    this.tasks.set(null);
    const call = this.view() === 'mine' ? this.service.mine() : this.service.assignedByMe();
    call.subscribe({
      next: (rows) => {
        this.tasks.set(rows);
        this.error.set(null);
      },
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected canMove(t: Task, step: -1 | 1): boolean {
    const index = ORDER.indexOf(t.status) + step;
    return index >= 0 && index < ORDER.length;
  }

  protected move(t: Task, step: -1 | 1): void {
    const next = ORDER[ORDER.indexOf(t.status) + step];
    if (!next) {
      return;
    }
    this.busyId.set(t.id);
    this.service.setStatus(t.id, next).subscribe({
      next: (updated) => {
        this.busyId.set(null);
        this.tasks.update((rows) => (rows ?? []).map((r) => (r.id === updated.id ? updated : r)));
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected canDelete(t: Task): boolean {
    return t.createdById === this.me()?.id || this.auth.hasRole('ADMIN');
  }

  protected remove(t: Task): void {
    if (!confirm(`Delete the task "${t.title}"?`)) {
      return;
    }
    this.busyId.set(t.id);
    this.service.delete(t.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.tasks.update((rows) => (rows ?? []).filter((r) => r.id !== t.id));
      },
      error: (err) => {
        this.busyId.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const assigneeId = v.assigneeId.trim() ? Number(v.assigneeId) : null;
    if (assigneeId !== null && !Number.isInteger(assigneeId)) {
      this.form.controls.assigneeId.setErrors({ server: 'Enter a whole employee ID' });
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    this.service
      .create({
        title: v.title,
        description: v.description,
        priority: v.priority,
        dueDate: v.dueDate || null,
        assigneeId,
      })
      .subscribe({
        next: (created) => {
          this.saving.set(false);
          this.showForm.set(false);
          this.form.reset({ priority: 'MEDIUM' });
          const forMe = created.assigneeId === this.me()?.id;
          // Show the new task in whichever view it belongs to.
          if ((this.view() === 'mine') === forMe) {
            this.tasks.update((rows) => [...(rows ?? []), created]);
          } else {
            this.setView(forMe ? 'mine' : 'assigned');
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.formError.set(apiErrorMessage(err));
          applyServerErrors(this.form, err);
        },
      });
  }
}
