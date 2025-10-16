export enum UserRole {
  Admin = 'Admin',
  ClubPresident = 'ClubPresident',
}

export enum BookingStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface Room {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  
  // New Requester Details
  requesterType: 'ClubPresident' | 'Student';
  clubName: string; // Kept for Club President, can be 'N/A' for students or used for department
  activityName: string;
  reason?: string; // Optional, for students
  requesterName: string;
  universityId: string;
  email: string;
  contactNumber: string;

  // Booking Status
  status: BookingStatus;
  rejectionReason?: string;
}

export interface CalendarSlot {
  room: Room;
  date: string;
}

export type BookingRequest = Omit<Booking, 'id' | 'status' | 'rejectionReason'>;

export interface AdminUser {
  id: string;
  username: string;
  password: string; // In a real app, this would be a hash.
}
