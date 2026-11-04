// Shapes of the data the dashboard displays.
// When the backend is ready, the Spring Boot API responses should match these.

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
}

export interface Weather {
  temperatureC: number;
  condition: string;
}

export interface Announcement {
  id: number;
  title: string;
  summary: string;
  author: string;
  postedAt: string; // local ISO date-time, e.g. 2026-11-05T09:30:00
}

export interface Course {
  id: number;
  title: string;
  durationMonths: number;
  icon: string;
}

export interface ServiceLink {
  id: number;
  title: string;
  description: string;
  icon: string;
  route: string;
}

export interface LeaveEntry {
  id: number;
  employeeName: string;
  jobTitle: string;
  leaveType: string;
  fromDate: string; // yyyy-MM-dd
  toDate: string; // yyyy-MM-dd
}

export interface Contact {
  id: number;
  name: string;
  email: string;
}

export interface CompanyEvent {
  id: number;
  title: string;
  date: string; // yyyy-MM-dd
}

export interface DashboardData {
  weather: Weather;
  tip: string;
  announcements: Announcement[];
  courses: Course[];
  services: ServiceLink[];
  leaves: LeaveEntry[];
  contacts: Contact[];
  events: CompanyEvent[];
}
