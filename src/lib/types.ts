
export type UserRole = 'admin' | 'student';
export type UserType = 'student' | 'employee';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  userType: UserType;
  college: string;
  studentId?: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface Visit {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userType: UserType;
  college: string;
  purpose: string;
  timestamp: any;
  academicYear: string;
}

export interface LibraryLog {
  id?: string;
  userId: string;
  studentId: string;
  department: string;
  studyDuration: string;
  timestamp: any;
}

export interface DeanLog {
  id?: string;
  userId: string;
  visitorName: string;
  studentId: string;
  purpose: 'Signature' | 'Consultation' | 'Document Submission';
  status: 'Waiting' | 'In Progress' | 'Completed';
  timestamp: any;
}
