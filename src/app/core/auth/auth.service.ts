import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { CurrentUser, Role } from '../models/dashboard.models';

interface Session {
  token: string;
  expiresAt: string; // ISO instant
  user: CurrentUser;
}

const STORAGE_KEY = 'employeehub.session';

/**
 * Holds the signed-in user and their access token. The token lives in sessionStorage, so it
 * survives a page reload but not closing the tab. Signing out just discards it.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(readSession());
  private expiryTimer?: ReturnType<typeof setTimeout>;

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  constructor() {
    this.scheduleExpiry(this.session());
  }

  token(): string | null {
    const s = this.session();
    if (!s) {
      return null;
    }
    if (Date.parse(s.expiresAt) <= Date.now()) {
      this.logout('expired');
      return null;
    }
    return s.token;
  }

  hasRole(...roles: Role[]): boolean {
    const role = this.user()?.role;
    return !!role && roles.includes(role);
  }

  login(username: string, password: string): Observable<CurrentUser> {
    return this.http
      .post<Session>('/api/auth/login', { username, password })
      .pipe(tap((s) => this.store(s)), map((s) => s.user));
  }

  /** The API signs out other sessions and returns a new token for this one. */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .post<Session>('/api/auth/change-password', { currentPassword, newPassword })
      .pipe(tap((s) => this.store(s)), map(() => undefined));
  }

  /** Re-reads the signed-in user, e.g. after they edit their own profile. */
  refreshUser(): void {
    this.http.get<CurrentUser>('/api/me').subscribe((user) => {
      const s = this.session();
      if (s) {
        this.store({ ...s, user });
      }
    });
  }

  logout(reason?: 'expired'): void {
    clearTimeout(this.expiryTimer);
    this.session.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
    const returnUrl = reason === 'expired' ? this.router.url : undefined;
    this.router.navigate(['/login'], {
      queryParams: reason ? { reason, returnUrl: returnUrl?.startsWith('/login') ? undefined : returnUrl } : {},
    });
  }

  private store(s: Session): void {
    this.session.set(s);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable: the session still works until reload */
    }
    this.scheduleExpiry(s);
  }

  private scheduleExpiry(s: Session | null): void {
    clearTimeout(this.expiryTimer);
    if (!s) {
      return;
    }
    const ms = Date.parse(s.expiresAt) - Date.now();
    // setTimeout overflows past ~24.8 days; tokens last hours, so this is only a guard.
    if (ms > 0 && ms < 2_000_000_000) {
      this.expiryTimer = setTimeout(() => this.logout('expired'), ms);
    }
  }
}

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const s = raw ? (JSON.parse(raw) as Session) : null;
    return s && s.token && Date.parse(s.expiresAt) > Date.now() ? s : null;
  } catch {
    return null;
  }
}
