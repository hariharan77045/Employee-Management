import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  DocumentDetail,
  DocumentRequest,
  DocumentSummary,
  Faq,
  LibraryItem,
  LibraryItemRequest,
  Loan,
  Task,
  TaskRequest,
  TaskStatus,
  Ticket,
  TicketRequest,
  TicketStatus,
} from '../models/portal.models';

/** /api/documents */
@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly http = inject(HttpClient);

  list(): Observable<DocumentSummary[]> {
    return this.http.get<DocumentSummary[]>('/api/documents');
  }

  get(id: number): Observable<DocumentDetail> {
    return this.http.get<DocumentDetail>(`/api/documents/${id}`);
  }

  create(body: DocumentRequest): Observable<DocumentDetail> {
    return this.http.post<DocumentDetail>('/api/documents', body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/documents/${id}`);
  }
}

/** /api/tasks */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);

  mine(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks/mine');
  }

  assignedByMe(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks/assigned-by-me');
  }

  create(body: TaskRequest): Observable<Task> {
    return this.http.post<Task>('/api/tasks', body);
  }

  setStatus(id: number, status: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`/api/tasks/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`);
  }
}

/** /api/library */
@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly http = inject(HttpClient);

  items(search: string, category: string): Observable<LibraryItem[]> {
    const params = new HttpParams().set('search', search).set('category', category);
    return this.http.get<LibraryItem[]>('/api/library/items', { params });
  }

  categories(): Observable<string[]> {
    return this.http.get<string[]>('/api/library/categories');
  }

  addItem(body: LibraryItemRequest): Observable<LibraryItem> {
    return this.http.post<LibraryItem>('/api/library/items', body);
  }

  myLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>('/api/library/loans/mine');
  }

  borrow(itemId: number): Observable<Loan> {
    return this.http.post<Loan>(`/api/library/items/${itemId}/borrow`, {});
  }

  giveBack(loanId: number): Observable<Loan> {
    return this.http.post<Loan>(`/api/library/loans/${loanId}/return`, {});
  }
}

/** /api/support */
@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);

  faqs(): Observable<Faq[]> {
    return this.http.get<Faq[]>('/api/support/faqs');
  }

  myTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>('/api/support/tickets/mine');
  }

  raise(body: TicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>('/api/support/tickets', body);
  }

  close(id: number): Observable<Ticket> {
    return this.http.post<Ticket>(`/api/support/tickets/${id}/close`, {});
  }

  queue(status: TicketStatus | ''): Observable<Ticket[]> {
    const params = status ? new HttpParams().set('status', status) : undefined;
    return this.http.get<Ticket[]>('/api/support/tickets', { params });
  }

  update(id: number, status: TicketStatus, resolution: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`/api/support/tickets/${id}`, { status, resolution });
  }
}
