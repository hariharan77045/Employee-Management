// Shapes for employees, leave and lookups. They match EmployeeDtos.java, LeaveDtos.java and CommonDtos.java.

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Lookup {
  id: number;
  name: string;
  detail: string | null;
}

export interface EmployeeSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: number | null;
  departmentName: string | null;
  designationId: number | null;
  designationName: string | null;
  hireDate: string;
}

export interface Address {
  line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
}

export interface ProjectAssignment {
  projectId: number;
  name: string;
  clientName: string;
  startDate: string;
  endDate: string;
  assignedDate: string;
}

export interface Payslip {
  id: number;
  month: string;
  basicSalary: number;
  bonus: number;
  deduction: number;
  netSalary: number;
}

export interface Review {
  id: number;
  reviewDate: string;
  rating: number;
  comments: string;
}

export interface AttendanceEntry {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Leave {
  id: number;
  employeeId: number;
  employeeName: string;
  jobTitle: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string | null;
  status: LeaveStatus;
}

export interface EmployeeDetail {
  id: number;
  firstName: string;
  lastName: string;
  gender: string | null;
  /** Null when the viewer may not see it (restricted). */
  dateOfBirth: string | null;
  email: string;
  phone: string;
  departmentId: number | null;
  departmentName: string | null;
  departmentLocation: string | null;
  designationId: number | null;
  designationName: string | null;
  grade: string | null;
  salary: number | null;
  hireDate: string;
  address: Address | null;
  projects: ProjectAssignment[];
  leaves: Leave[];
  payslips: Payslip[];
  reviews: Review[];
  attendance: AttendanceEntry[];
  /** True when private details were left out because of the viewer's role. */
  restricted: boolean;
}

export interface EmployeeRequest {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  departmentId: number;
  designationId: number;
  salary: number;
  hireDate: string;
  address: Address;
}

export interface ApplyLeaveRequest {
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}
