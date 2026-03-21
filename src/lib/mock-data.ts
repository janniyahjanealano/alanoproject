export const DEPARTMENTS = [
  "College of Engineering",
  "College of Computer Studies",
  "College of Arts and Sciences",
  "College of Business Administration",
  "College of Education",
  "Graduate School",
  "Senior High School"
];

export const VISIT_REASONS = [
  "Study / Individual Work",
  "Group Research",
  "Book Borrowing/Return",
  "Printing/Encoding Services",
  "Online Class",
  "Seminar / Workshop"
];

export interface Visit {
  id: string;
  userEmail: string;
  userName: string;
  department: string;
  reason: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'visitor';
  isBlocked: boolean;
}

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Dr. Elena Reyes', email: 'e.reyes@neu.edu', role: 'admin', isBlocked: false },
  { id: '2', name: 'John Doe', email: 'j.doe@neu.edu', role: 'visitor', isBlocked: false },
  { id: '3', name: 'Jane Smith', email: 'j.smith@neu.edu', role: 'visitor', isBlocked: false },
  { id: '4', name: 'Mark Wilson', email: 'm.wilson@neu.edu', role: 'visitor', isBlocked: true },
  { id: '5', name: 'Sarah Connor', email: 's.connor@neu.edu', role: 'visitor', isBlocked: false },
];

export const MOCK_VISITS: Visit[] = [
  { id: 'v1', userEmail: 'j.doe@neu.edu', userName: 'John Doe', department: 'College of Engineering', reason: 'Study / Individual Work', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'v2', userEmail: 'j.smith@neu.edu', userName: 'Jane Smith', department: 'College of Computer Studies', reason: 'Group Research', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'v3', userEmail: 's.connor@neu.edu', userName: 'Sarah Connor', department: 'College of Arts and Sciences', reason: 'Seminar / Workshop', timestamp: new Date(Date.now() - 86400000).toISOString() },
  { id: 'v4', userEmail: 'j.doe@neu.edu', userName: 'John Doe', department: 'College of Engineering', reason: 'Online Class', timestamp: new Date(Date.now() - 172800000).toISOString() },
  { id: 'v5', userEmail: 'j.smith@neu.edu', userName: 'Jane Smith', department: 'College of Computer Studies', reason: 'Study / Individual Work', timestamp: new Date(Date.now() - 604800000).toISOString() },
];
