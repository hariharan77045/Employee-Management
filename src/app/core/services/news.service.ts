import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Announcement, CompanyEvent } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly http = inject(HttpClient);

  announcements(): Observable<Announcement[]> {
    return this.http.get<Announcement[]>('/api/announcements');
  }

  postAnnouncement(body: { title: string; summary: string }): Observable<Announcement> {
    return this.http.post<Announcement>('/api/announcements', body);
  }

  deleteAnnouncement(id: number): Observable<void> {
    return this.http.delete<void>(`/api/announcements/${id}`);
  }

  events(): Observable<CompanyEvent[]> {
    return this.http.get<CompanyEvent[]>('/api/events');
  }

  createEvent(body: { title: string; description: string; date: string; location: string }): Observable<CompanyEvent> {
    return this.http.post<CompanyEvent>('/api/events', body);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`/api/events/${id}`);
  }
}
