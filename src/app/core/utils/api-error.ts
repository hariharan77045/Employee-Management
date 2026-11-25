import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

/** The Spring Boot API returns RFC 9457 problem details; pull out a message a person can act on. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0 || error.status === 502 || error.status === 504) {
      return "Can't reach the server. Make sure the Spring Boot API is running on port 8080.";
    }
    const detail = error.error?.detail;
    if (typeof detail === 'string' && detail) {
      return detail;
    }
    return `The server returned an error (${error.status}).`;
  }
  return 'Something went wrong. Please try again.';
}

/** Copies per-field validation errors from the API onto matching form controls. */
export function applyServerErrors(form: FormGroup, error: unknown): void {
  if (!(error instanceof HttpErrorResponse)) {
    return;
  }
  const errors: Record<string, string> | undefined = error.error?.errors;
  for (const [path, message] of Object.entries(errors ?? {})) {
    const control: AbstractControl | null = form.get(path);
    control?.setErrors({ server: message });
    control?.markAsTouched();
  }
}
