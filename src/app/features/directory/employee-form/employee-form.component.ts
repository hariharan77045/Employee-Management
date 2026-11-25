import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { EmployeeDetail, EmployeeRequest } from '../../../core/models/employee.models';
import { EmployeeService } from '../../../core/services/employee.service';
import { apiErrorMessage, applyServerErrors } from '../../../core/utils/api-error';
import { toDateKey } from '../../../core/utils/date.utils';
import { IconComponent } from '../../../shared/icon.component';

/** Add / edit employee dialog. Pass `employee` to edit; leave it empty to add. */
@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './employee-form.component.html',
})
export class EmployeeFormComponent implements OnInit {
  private readonly service = inject(EmployeeService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly employee = input<EmployeeDetail | null>(null);
  readonly saved = output<EmployeeDetail>();
  readonly closed = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly departments = toSignal(this.service.departments(), { initialValue: [] });
  protected readonly designations = toSignal(this.service.designations(), { initialValue: [] });
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly today = toDateKey(new Date());

  protected readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    gender: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    departmentId: [0, Validators.min(1)],
    designationId: [0, Validators.min(1)],
    salary: [0, [Validators.required, Validators.min(0), Validators.max(99999999.99)]],
    hireDate: [this.today, Validators.required],
    address: this.fb.group({
      line: ['', Validators.maxLength(200)],
      city: ['', Validators.maxLength(100)],
      state: ['', Validators.maxLength(100)],
      pincode: ['', Validators.maxLength(10)],
      country: ['India', Validators.maxLength(50)],
    }),
  });

  ngOnInit(): void {
    const e = this.employee();
    if (e) {
      this.form.patchValue({
        firstName: e.firstName,
        lastName: e.lastName,
        gender: e.gender ?? '',
        dateOfBirth: e.dateOfBirth ?? '',
        email: e.email ?? '',
        phone: e.phone ?? '',
        departmentId: e.departmentId ?? 0,
        designationId: e.designationId ?? 0,
        salary: e.salary ?? 0,
        hireDate: e.hireDate ?? '',
        address: {
          line: e.address?.line ?? '',
          city: e.address?.city ?? '',
          state: e.address?.state ?? '',
          pincode: e.address?.pincode ?? '',
          country: e.address?.country ?? '',
        },
      });
    }
    this.dialog().nativeElement.showModal();
  }

  /** Message for a control, or null when it is valid or untouched. */
  protected errorFor(path: string): string | null {
    const control = this.form.get(path);
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    const errors = control.errors;
    if (errors['server']) return errors['server'];
    const isLookup = path === 'departmentId' || path === 'designationId';
    if (errors['required'] || (errors['min'] && isLookup)) {
      return 'Required';
    }
    if (errors['email']) return 'Enter a valid email address';
    if (errors['pattern']) return 'Use 10 to 15 digits';
    if (errors['maxlength']) return `At most ${errors['maxlength'].requiredLength} characters`;
    if (errors['min'] || errors['max']) return 'Enter a valid amount';
    return 'Invalid value';
  }

  protected close(): void {
    this.dialog().nativeElement.close();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    const body: EmployeeRequest = this.form.getRawValue();
    const id = this.employee()?.id;
    const request$ = id ? this.service.update(id, body) : this.service.create(body);

    request$.subscribe({
      next: (result) => {
        this.saving.set(false);
        this.saved.emit(result);
        this.close();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err));
        applyServerErrors(this.form, err);
      },
    });
  }
}
