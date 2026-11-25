// Shapes of the data the dashboard displays. They match the Spring Boot DTOs in DashboardDtos.java.

/** ADMIN > HR > MANAGER > EMPLOYEE; see Role.java. */
export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  departmentName: string | null;
  role: Role;
}

/** A row on the admin "User accounts" page (AuthDtos.UserAccount). */
export interface UserAccount {
  id: number;
  employeeId: number;
  employeeName: string;
  username: string;
  role: Role;
  enabled: boolean;
  locked: boolean;
  lastLoginAt: string | null;
}

export interface Weather {
  temperatureC: number;
  condition: string;
}

export interface DashboardStats {
  employees: number;
  departments: number;
  projects: number;
  pendingLeaves: number;
  onLeaveToday: number;
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
  description: string | null;
  date: string; // yyyy-MM-dd
  location: string | null;
}

export interface DashboardData {
  weather: Weather;
  tip: string;
  stats: DashboardStats;
  announcements: Announcement[];
  courses: Course[];
  services: ServiceLink[];
  leaves: LeaveEntry[];
  contacts: Contact[];
  events: CompanyEvent[];
}
