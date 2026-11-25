import { Role } from '../core/models/dashboard.models';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** Only these roles see the item; everyone when omitted. */
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: 'home', icon: 'home' },
  { label: 'My profile', path: 'my-profile', icon: 'user' },
  { label: 'My services', path: 'my-services', icon: 'grid' },
  { label: 'Documents', path: 'documents', icon: 'file' },
  { label: 'Directory', path: 'directory', icon: 'folder' },
  { label: 'News & events', path: 'news-events', icon: 'news' },
  { label: 'Tasks', path: 'tasks', icon: 'tasks' },
  { label: 'Library', path: 'library', icon: 'book' },
  { label: 'Help & support', path: 'help', icon: 'help' },
  { label: 'User accounts', path: 'admin/users', icon: 'shield', roles: ['ADMIN'] },
];
