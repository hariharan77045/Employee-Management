import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import { CurrentUser, DashboardData } from '../models/dashboard.models';
import { MOCK_DASHBOARD, MOCK_USER } from './dashboard.mock';

/**
 * The only place components get dashboard data from.
 * For backend integration, replace these bodies with HttpClient calls, for example:
 *   return this.http.get<DashboardData>('/api/dashboard');
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly mockLatencyMs = 300;

  getCurrentUser(): Observable<CurrentUser> {
    return of(MOCK_USER).pipe(delay(this.mockLatencyMs));
  }

  getDashboard(): Observable<DashboardData> {
    return of(MOCK_DASHBOARD).pipe(delay(this.mockLatencyMs));
  }
}
