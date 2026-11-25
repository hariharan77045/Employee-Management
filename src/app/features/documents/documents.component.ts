import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';
import { DocumentDetail, DocumentSummary } from '../../core/models/portal.models';
import { DocumentService } from '../../core/services/portal.services';
import { apiErrorMessage, applyServerErrors } from '../../core/utils/api-error';
import { IconComponent } from '../../shared/icon.component';

type Scope = 'all' | 'company' | 'personal';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent {
  private readonly service = inject(DocumentService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder).nonNullable;

  /** HR and admins publish and delete documents; the API enforces the same rule. */
  protected readonly canManage = computed(() => !!this.auth.user() && this.auth.hasRole('ADMIN', 'HR'));

  protected readonly documents = signal<DocumentSummary[] | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly query = signal('');
  protected readonly scope = signal<Scope>('all');

  protected readonly selected = signal<DocumentDetail | null>(null);
  protected readonly opening = signal<number | null>(null);

  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    category: ['Policies', [Validators.required, Validators.maxLength(50)]],
    description: ['', Validators.maxLength(300)],
    content: ['', [Validators.required, Validators.maxLength(20000)]],
    ownerId: [''],
  });

  /** Documents matching the search and scope, grouped by category. */
  protected readonly groups = computed(() => {
    const q = this.query().trim().toLowerCase();
    const scope = this.scope();
    const rows = (this.documents() ?? []).filter(
      (d) =>
        (scope === 'all' || (scope === 'personal') === d.personal) &&
        (!q || d.title.toLowerCase().includes(q) || (d.description ?? '').toLowerCase().includes(q)),
    );
    const byCategory = new Map<string, DocumentSummary[]>();
    for (const d of rows) {
      const key = d.personal ? 'Personal' : d.category;
      byCategory.set(key, [...(byCategory.get(key) ?? []), d]);
    }
    return [...byCategory.entries()].map(([category, docs]) => ({ category, docs }));
  });

  protected readonly counts = computed(() => {
    const rows = this.documents() ?? [];
    return { all: rows.length, personal: rows.filter((d) => d.personal).length };
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.service.list().subscribe({
      next: (rows) => {
        this.documents.set(rows);
        this.error.set(null);
        const first = rows[0];
        if (first && !this.selected()) {
          this.open(first);
        }
      },
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected open(doc: DocumentSummary): void {
    this.opening.set(doc.id);
    this.service.get(doc.id).subscribe({
      next: (detail) => {
        this.opening.set(null);
        this.selected.set(detail);
      },
      error: (err) => {
        this.opening.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  /** Saves the document as a .txt file; the text is already in the browser, so no extra request. */
  protected download(doc: DocumentDetail): void {
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/[^\w\- ]+/g, '').trim() || 'document'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected publish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const ownerId = value.ownerId.trim() ? Number(value.ownerId) : null;
    if (ownerId !== null && !Number.isInteger(ownerId)) {
      this.form.controls.ownerId.setErrors({ server: 'Enter a whole employee ID or leave it empty' });
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    this.service.create({ ...value, ownerId }).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ category: 'Policies' });
        // Someone else's personal document isn't in our list; reload to stay accurate.
        this.load();
        this.selected.set(created);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(apiErrorMessage(err));
        applyServerErrors(this.form, err);
      },
    });
  }

  protected remove(doc: DocumentDetail): void {
    if (!confirm(`Delete "${doc.title}"? This can't be undone.`)) {
      return;
    }
    this.service.delete(doc.id).subscribe({
      next: () => {
        this.documents.update((rows) => (rows ?? []).filter((d) => d.id !== doc.id));
        this.selected.set(null);
      },
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }
}
