import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import { IconComponent } from '../../shared/icon.component';

/** Practice accounts created by UserAccountSeeder.java. */
const DEMO_ACCOUNTS = [
  { email: 'employee1@company.com', role: 'Admin' },
  { email: 'employee2@company.com', role: 'HR' },
  { email: 'employee3@company.com', role: 'Manager' },
  { email: 'employee4@company.com', role: 'Employee' },
];

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Query parameters (?returnUrl=…&reason=expired), bound by withComponentInputBinding. */
  readonly returnUrl = input<string>();
  readonly reason = input<string>();

  protected readonly demoAccounts = DEMO_ACCOUNTS;
  protected readonly demoPassword = 'Password@123';
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected useDemo(email: string): void {
    this.form.setValue({ username: email, password: this.demoPassword });
    this.error.set(null);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const { username, password } = this.form.getRawValue();

    this.auth.login(username.trim(), password).subscribe({
      next: () => this.router.navigateByUrl(safeReturnUrl(this.returnUrl())),
      error: (err) => {
        this.submitting.set(false);
        this.error.set(apiErrorMessage(err));
        this.form.controls.password.reset('');
      },
    });
  }
}

/** Only follow in-app paths, never another site. */
function safeReturnUrl(url: string | undefined): string {
  return url && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/login') ? url : '/home';
}
