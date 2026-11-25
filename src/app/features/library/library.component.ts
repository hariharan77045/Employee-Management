import { DatePipe, formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, debounceTime } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { LABELS, LibraryFormat, LibraryItem, Loan } from '../../core/models/portal.models';
import { LibraryService } from '../../core/services/portal.services';
import { apiErrorMessage, applyServerErrors } from '../../core/utils/api-error';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './library.component.html',
  styleUrl: './library.component.scss',
})
export class LibraryComponent {
  private readonly service = inject(LibraryService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly labels = LABELS;
  protected readonly formats: LibraryFormat[] = ['BOOK', 'EBOOK', 'VIDEO', 'COURSE'];
  /** HR and admins add catalogue items; the API enforces the same rule. */
  protected readonly canManage = computed(() => !!this.auth.user() && this.auth.hasRole('ADMIN', 'HR'));

  protected readonly query = signal('');
  protected readonly category = signal('');
  protected readonly availableOnly = signal(false);

  protected readonly categories = toSignal(this.service.categories(), { initialValue: [] as string[] });
  protected readonly items = signal<LibraryItem[] | null>(null);
  protected readonly loans = signal<Loan[] | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly busy = signal<string | null>(null);

  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    author: ['', Validators.maxLength(150)],
    category: ['', [Validators.required, Validators.maxLength(50)]],
    format: ['BOOK' as LibraryFormat, Validators.required],
    description: ['', Validators.maxLength(2000)],
    totalCopies: [1, [Validators.required, Validators.min(0), Validators.max(500)]],
  });

  protected readonly visible = computed(() =>
    (this.items() ?? []).filter((i) => !this.availableOnly() || i.available > 0 || i.borrowedByMe),
  );
  protected readonly activeLoans = computed(() => (this.loans() ?? []).filter((l) => !l.returnedOn));
  protected readonly pastLoans = computed(() => (this.loans() ?? []).filter((l) => l.returnedOn));

  constructor() {
    // Re-query the catalogue when the search or category changes (search is debounced while typing).
    combineLatest([toObservable(this.query).pipe(debounceTime(250)), toObservable(this.category)])
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.loadItems());
    this.loadLoans();
  }

  private loadItems(): void {
    this.service.items(this.query().trim(), this.category()).subscribe({
      next: (rows) => {
        this.items.set(rows);
        this.error.set(null);
      },
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  private loadLoans(): void {
    this.service.myLoans().subscribe({
      next: (rows) => this.loans.set(rows),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected borrow(item: LibraryItem): void {
    this.busy.set(`item-${item.id}`);
    this.notice.set(null);
    this.service.borrow(item.id).subscribe({
      next: (loan) => {
        this.busy.set(null);
        this.notice.set(`Borrowed "${loan.title}". Please return it by ${formatDate(loan.dueOn, 'MMM d, y', 'en-US')}.`);
        this.loadItems();
        this.loadLoans();
      },
      error: (err) => {
        this.busy.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected giveBack(loan: Loan): void {
    this.busy.set(`loan-${loan.id}`);
    this.notice.set(null);
    this.service.giveBack(loan.id).subscribe({
      next: () => {
        this.busy.set(null);
        this.notice.set(`Returned "${loan.title}". Thank you!`);
        this.loadItems();
        this.loadLoans();
      },
      error: (err) => {
        this.busy.set(null);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected addItem(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    this.service.addItem(this.form.getRawValue()).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.showForm.set(false);
        this.form.reset({ format: 'BOOK', totalCopies: 1 });
        this.notice.set(`Added "${created.title}" to the catalogue.`);
        this.loadItems();
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(apiErrorMessage(err));
        applyServerErrors(this.form, err);
      },
    });
  }
}
