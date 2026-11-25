import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApplyLeaveRequest, Leave, LeaveStatus, Payslip } from '../models/employee.models';

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private readonly http = inject(HttpClient);

  myLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>('/api/me/leaves');
  }

  apply(body: ApplyLeaveRequest): Observable<Leave> {
    return this.http.post<Leave>('/api/me/leaves', body);
  }

  withdraw(id: number): Observable<void> {
    return this.http.delete<void>(`/api/me/leaves/${id}`);
  }

  myPayslips(): Observable<Payslip[]> {
    return this.http.get<Payslip[]>('/api/me/payslips');
  }

  list(status?: LeaveStatus): Observable<Leave[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Leave[]>('/api/leaves', { params });
  }

  setStatus(id: number, status: Exclude<LeaveStatus, 'Pending'>): Observable<Leave> {
    return this.http.patch<Leave>(`/api/leaves/${id}/status`, { status });
  }

  types(): Observable<string[]> {
    return this.http.get<string[]>('/api/leaves/types');
  }
}
