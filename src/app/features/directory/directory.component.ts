import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';

import { EmployeeDetail, EmployeeSummary, Page } from '../../core/models/employee.models';
import { EmployeeService } from '../../core/services/employee.service';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

interface ListState {
  loading: boolean;
  page: Page<EmployeeSummary> | null;
  error: string | null;
}

const PAGE_SIZE = 10;

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [DatePipe, RouterLink, AvatarComponent, IconComponent, EmployeeFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './directory.component.html',
  styleUrl: './directory.component.scss',
})
export class DirectoryComponent {
  private readonly service = inject(EmployeeService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  /** HR and admins add employees; the API enforces the same rule. */
  protected readonly canManage = computed(() => !!this.auth.user() && this.auth.hasRole('ADMIN', 'HR'));

  protected readonly search = signal('');
  protected readonly departmentId = signal<number | null>(null);
  protected readonly page = signal(0);
  protected readonly showForm = signal(false);
  private readonly reload = signal(0);

  protected readonly departments = toSignal(this.service.departments(), { initialValue: [] });

  private readonly query = computed(() => ({
    search: this.search(),
    departmentId: this.departmentId(),
    page: this.page(),
    size: PAGE_SIZE,
    reload: this.reload(),
  }));

  protected readonly state = toSignal(
    toObservable(this.query).pipe(
      debounceTime(250),
      switchMap((query) =>
        this.service.search(query).pipe(
          map((page): ListState => ({ loading: false, page, error: null })),
          catchError((err) => of<ListState>({ loading: false, page: null, error: apiErrorMessage(err) })),
          startWith<ListState>({ loading: true, page: null, error: null }),
        ),
      ),
    ),
    { initialValue: { loading: true, page: null, error: null } as ListState },
  );

  // Keep showing the previous page while the next one loads, so the table doesn't flash.
  private lastPage: Page<EmployeeSummary> | null = null;
  protected readonly visiblePage = computed(() => {
    const page = this.state().page;
    if (page) {
      this.lastPage = page;
    }
    return page ?? (this.state().loading ? this.lastPage : null);
  });

  protected readonly rangeLabel = computed(() => {
    const page = this.visiblePage();
    if (!page || page.totalElements === 0) {
      return '';
    }
    const from = page.page * page.size + 1;
    const to = from + page.content.length - 1;
    return `${from}–${to} of ${page.totalElements}`;
  });

  constructor() {
    // The top bar search sends people here as /directory?q=...
    inject(ActivatedRoute)
      .queryParamMap.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((params) => {
        const q = params.get('q');
        if (q !== null) {
          this.search.set(q);
          this.page.set(0);
        }
      });
  }

  protected onSearch(value: string): void {
    this.search.set(value);
    this.page.set(0);
  }

  protected onDepartment(value: string): void {
    this.departmentId.set(value ? Number(value) : null);
    this.page.set(0);
  }

  protected goTo(page: number): void {
    this.page.set(page);
  }

  protected onCreated(employee: EmployeeDetail): void {
    this.reload.update((n) => n + 1);
    this.router.navigate(['/directory', employee.id]);
  }
}
