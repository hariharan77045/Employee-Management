import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage, applyServerErrors } from '../../core/utils/api-error';
import { IconComponent } from '../../shared/icon.component';

/** Same rule as AuthDtos.PASSWORD_POLICY on the server. */
const POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,64}$/;

function matchValidator(group: AbstractControl): ValidationErrors | null {
  return group.get('newPassword')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <h1>Change password</h1>
          <p>Changing it signs you out on every other device.</p>
        </div>
      </header>

      <section class="card card-pad narrow">
        @if (error(); as message) {
          <p class="alert" role="alert"><app-icon name="alert" /> {{ message }}</p>
        }
        @if (done()) {
          <p class="alert success" role="status"><app-icon name="check" /> Password changed.</p>
        }

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <label class="field" [class.invalid]="invalid('currentPassword')">
            <span>Current password</span>
            <input type="password" formControlName="currentPassword" autocomplete="current-password" />
            @if (invalid('currentPassword')) { <small class="error">Enter your current password</small> }
          </label>

          <label class="field" [class.invalid]="invalid('newPassword')">
            <span>New password</span>
            <input type="password" formControlName="newPassword" autocomplete="new-password" aria-describedby="pw-rule" />
            <small id="pw-rule" [class.error]="invalid('newPassword')">
              {{ form.controls.newPassword.errors?.['server'] ?? '8–64 characters with an upper-case letter, a lower-case letter and a digit.' }}
            </small>
          </label>

          <label class="field" [class.invalid]="form.controls.confirm.touched && form.hasError('mismatch')">
            <span>Confirm new password</span>
            <input type="password" formControlName="confirm" autocomplete="new-password" />
            @if (form.controls.confirm.touched && form.hasError('mismatch')) {
              <small class="error">The passwords don't match</small>
            }
          </label>

          <div>
            <button class="btn btn-primary" type="submit" [disabled]="saving()">
              {{ saving() ? 'Saving…' : 'Change password' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  `,
  styles: `
    .narrow { max-width: 460px; height: auto; }
    form { display: grid; gap: 14px; }
  `,
})
export class ChangePasswordComponent {
  private readonly auth = inject(AuthService);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly done = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(POLICY)]],
      confirm: ['', Validators.required],
    },
    { validators: matchValidator },
  );

  protected invalid(name: 'currentPassword' | 'newPassword'): boolean {
    const c = this.form.controls[name];
    return c.touched && c.invalid;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.done.set(false);
    const { currentPassword, newPassword } = this.form.getRawValue();

    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.saving.set(false);
        this.done.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err));
        applyServerErrors(this.form, err);
      },
    });
  }
}
