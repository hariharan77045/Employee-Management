import { CurrentUser, DashboardData } from '../models/dashboard.models';
import { daysFromToday } from '../utils/date.utils';

export const MOCK_USER: CurrentUser = {
  id: 1,
  firstName: 'David',
  lastName: 'John',
  jobTitle: 'Software Engineer',
};

// Dates are relative to today so the dashboard never looks out of date.
export const MOCK_DASHBOARD: DashboardData = {
  weather: { temperatureC: 30, condition: 'Partly cloudy' },
  tip: 'Grab a cup of coffee and let’s get some work done!',
  announcements: [
    {
      id: 1,
      title: 'Wellness program',
      summary: 'Enjoy a week-long wellness program at all our offices.',
      author: 'Anita Rao',
      postedAt: `${daysFromToday(-1)}T09:37:00`,
    },
    {
      id: 2,
      title: 'Quarterly town hall',
      summary: 'Join the leadership team for company updates and an open Q&A.',
      author: 'Mark Lee',
      postedAt: `${daysFromToday(-3)}T16:10:00`,
    },
  ],
  courses: [
    { id: 1, title: 'Career Development', durationMonths: 3, icon: 'graduation' },
    { id: 2, title: 'Compliance Training', durationMonths: 2, icon: 'shield' },
    { id: 3, title: 'Technical Training', durationMonths: 6, icon: 'code' },
    { id: 4, title: 'Labs', durationMonths: 1, icon: 'flask' },
  ],
  services: [
    { id: 1, title: 'Tasks', description: 'View your daily tasks', icon: 'tasks', route: '/tasks' },
    { id: 2, title: 'Learning', description: 'View your current courses', icon: 'book', route: '/library' },
    { id: 3, title: 'Time off', description: 'View your leave status', icon: 'clock', route: '/my-services' },
    { id: 4, title: 'Salary slip', description: 'View your salary slip', icon: 'wallet', route: '/my-services' },
  ],
  leaves: [
    {
      id: 1,
      employeeName: 'Julia Reyes',
      jobTitle: 'UX Designer',
      leaveType: 'Sick leave',
      fromDate: daysFromToday(0),
      toDate: daysFromToday(1),
    },
    {
      id: 2,
      employeeName: 'Omar Haddad',
      jobTitle: 'QA Engineer',
      leaveType: 'Annual vacation',
      fromDate: daysFromToday(0),
      toDate: daysFromToday(6),
    },
    {
      id: 3,
      employeeName: 'Grace Kim',
      jobTitle: 'HR Manager',
      leaveType: 'Casual leave',
      fromDate: daysFromToday(2),
      toDate: daysFromToday(2),
    },
  ],
  contacts: [
    { id: 1, name: 'Rahul Dev', email: 'rahul.dev@example.com' },
    { id: 2, name: 'Rahul Raj', email: 'rahul.raj@example.com' },
    { id: 3, name: 'Meena Iyer', email: 'meena.iyer@example.com' },
    { id: 4, name: 'Sam Carter', email: 'sam.carter@example.com' },
  ],
  events: [
    { id: 1, title: 'Data science workshop', date: daysFromToday(3) },
    { id: 2, title: 'New product launch', date: daysFromToday(9) },
    { id: 3, title: 'Hackathon', date: daysFromToday(16) },
  ],
};
