// Shapes for the Documents, Tasks, Library and Help & support pages. They match PortalDtos.java.

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'IT' | 'HR' | 'PAYROLL' | 'FACILITIES' | 'OTHER';
export type LibraryFormat = 'BOOK' | 'EBOOK' | 'VIDEO' | 'COURSE';

export interface DocumentSummary {
  id: number;
  title: string;
  category: string;
  description: string | null;
  personal: boolean;
  uploadedBy: string;
  updatedAt: string;
}

export interface DocumentDetail extends DocumentSummary {
  content: string;
}

export interface DocumentRequest {
  title: string;
  category: string;
  description: string;
  content: string;
  ownerId: number | null;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  overdue: boolean;
  createdAt: string;
  completedAt: string | null;
  assigneeId: number;
  assigneeName: string;
  createdById: number | null;
  createdByName: string | null;
}

export interface TaskRequest {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  assigneeId: number | null;
}

export interface LibraryItem {
  id: number;
  title: string;
  author: string | null;
  category: string;
  format: LibraryFormat;
  description: string | null;
  totalCopies: number;
  available: number;
  borrowedByMe: boolean;
}

export interface LibraryItemRequest {
  title: string;
  author: string;
  category: string;
  format: LibraryFormat;
  description: string;
  totalCopies: number;
}

export interface Loan {
  id: number;
  itemId: number;
  title: string;
  author: string | null;
  format: LibraryFormat;
  borrowedOn: string;
  dueOn: string;
  returnedOn: string | null;
  overdue: boolean;
}

export interface Faq {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export interface Ticket {
  id: number;
  employeeId: number;
  employeeName: string;
  category: TicketCategory;
  subject: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketRequest {
  category: TicketCategory;
  subject: string;
  description: string;
  priority: Priority;
}

/** Readable labels for enum values shown in the UI. */
export const LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
  OPEN: 'Open',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  IT: 'IT',
  HR: 'HR',
  PAYROLL: 'Payroll',
  FACILITIES: 'Facilities',
  OTHER: 'Other',
  BOOK: 'Book',
  EBOOK: 'E-book',
  VIDEO: 'Video',
  COURSE: 'Course',
};
