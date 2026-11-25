import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { EmployeeDetail, EmployeeRequest, EmployeeSummary, Lookup, Page } from '../models/employee.models';

export interface EmployeeQuery {
  search: string;
  departmentId: number | null;
  page: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);

  // Reference data rarely changes, so each list is fetched once per session.
  private readonly departments$ = this.http.get<Lookup[]>('/api/departments').pipe(shareReplay(1));
  private readonly designations$ = this.http.get<Lookup[]>('/api/designations').pipe(shareReplay(1));

  search(query: EmployeeQuery): Observable<Page<EmployeeSummary>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.search.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.departmentId) {
      params = params.set('departmentId', query.departmentId);
    }
    return this.http.get<Page<EmployeeSummary>>('/api/employees', { params });
  }

  get(id: number): Observable<EmployeeDetail> {
    return this.http.get<EmployeeDetail>(`/api/employees/${id}`);
  }

  create(body: EmployeeRequest): Observable<EmployeeDetail> {
    return this.http.post<EmployeeDetail>('/api/employees', body);
  }

  update(id: number, body: EmployeeRequest): Observable<EmployeeDetail> {
    return this.http.put<EmployeeDetail>(`/api/employees/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/employees/${id}`);
  }

  departments(): Observable<Lookup[]> {
    return this.departments$;
  }

  designations(): Observable<Lookup[]> {
    return this.designations$;
  }
}
