import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Role, UserAccount } from '../models/dashboard.models';

/** /api/admin/users — ADMIN only. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  users(): Observable<UserAccount[]> {
    return this.http.get<UserAccount[]>('/api/admin/users');
  }

  update(id: number, role: Role, enabled: boolean): Observable<UserAccount> {
    return this.http.put<UserAccount>(`/api/admin/users/${id}`, { role, enabled });
  }

  unlock(id: number): Observable<UserAccount> {
    return this.http.post<UserAccount>(`/api/admin/users/${id}/unlock`, {});
  }

  resetPassword(id: number): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(`/api/admin/users/${id}/reset-password`, {});
  }
}
