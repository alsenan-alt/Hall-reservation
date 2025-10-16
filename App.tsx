
import React, { useState, useCallback } from 'react';
import { UserRole, Room, Booking, BookingStatus, BookingRequest, AdminUser } from './types';
import Header from './components/Header';
import AdminView from './components/AdminView';
import ClubPresidentView from './components/ClubPresidentView';
import LoginView from './components/LoginView';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ClubPresident);
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'قاعة الاجتماعات الرئيسية' },
    { id: '2', name: 'المسرح الطلابي' },
    { id: '3', name: 'قاعة الأنشطة الرياضية' },
    { id: '4', name: 'معمل الحاسب الآلي' },
  ]);
  const [bookings, setBookings] = useState<Booking[]>([
    { 
      id: 'b1', 
      roomId: '1', 
      date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], 
      requesterType: 'ClubPresident',
      clubName: 'نادي البرمجة', 
      activityName: 'ورشة عمل React',
      requesterName: 'أحمد الغامدي',
      universityId: '44100123',
      email: 'ahmed@example.com',
      contactNumber: '0501234567',
      status: BookingStatus.Approved,
    },
     { 
      id: 'b2', 
      roomId: '2', 
      date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
      requesterType: 'Student',
      clubName: 'مبادرة طلابية',
      activityName: 'اجتماع تحضيري',
      reason: 'التحضير لفعالية اليوم الوطني.',
      requesterName: 'فاطمة الزهراني',
      universityId: '44100456',
      email: 'fatima@example.com',
      contactNumber: '0557654321',
      status: BookingStatus.Pending,
    },
    { 
      id: 'b3', 
      roomId: '3', 
      date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
      requesterType: 'ClubPresident',
      clubName: 'نادي التصوير',
      activityName: 'محاضرة عن التصوير الليلي',
      requesterName: 'خالد العمري',
      universityId: '44100789',
      email: 'khalid@example.com',
      contactNumber: '0512345678',
      status: BookingStatus.Rejected,
      rejectionReason: 'القاعة محجوزة لفعالية أخرى في نفس اليوم.'
    }
  ]);

  // --- Admin Auth State ---
  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: 'admin1', username: 'admin', password: 'password123' }
  ]);
  const [loggedInUser, setLoggedInUser] = useState<AdminUser | null>(null);

  const handleLogin = useCallback((username: string, password: string): boolean => {
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
      setLoggedInUser(admin);
      return true;
    }
    return false;
  }, [admins]);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
  }, []);

  const addAdmin = useCallback((username: string, password: string) => {
    if (username.trim() === '' || password.trim() === '') return;
    if (admins.some(admin => admin.username === username)) {
      alert('اسم المستخدم موجود بالفعل.');
      return;
    }
    const newAdmin: AdminUser = {
        id: `admin${Date.now()}`,
        username,
        password,
    };
    setAdmins(prevAdmins => [...prevAdmins, newAdmin]);
    alert(`تمت إضافة المسؤول "${username}" بنجاح.`);
  }, [admins]);
  
  const updateAdmin = useCallback((adminId: string, newUsername: string, newPassword?: string) => {
    setAdmins(prevAdmins => {
      // Check for username conflict
      if (prevAdmins.some(admin => admin.id !== adminId && admin.username === newUsername)) {
        alert('اسم المستخدم موجود بالفعل.');
        return prevAdmins;
      }
      return prevAdmins.map(admin => {
        if (admin.id === adminId) {
          const updatedAdmin = {
            ...admin,
            username: newUsername.trim() !== '' ? newUsername : admin.username,
            password: newPassword && newPassword.trim() !== '' ? newPassword : admin.password,
          };
          // If we are updating the logged-in user, update the loggedInUser state as well
          if (loggedInUser?.id === adminId) {
            setLoggedInUser(updatedAdmin);
          }
          return updatedAdmin;
        }
        return admin;
      });
    });
    alert(`تم تحديث بيانات المسؤول بنجاح.`);
  }, [admins, loggedInUser]);


  const addRoom = useCallback((roomName: string) => {
    if (roomName.trim() === '') return;
    const newRoom: Room = {
      id: `r${Date.now()}`,
      name: roomName,
    };
    setRooms(prevRooms => [...prevRooms, newRoom]);
  }, []);

  const deleteRoom = useCallback((roomId: string) => {
    setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
    setBookings(prevBookings => prevBookings.filter(booking => booking.roomId !== roomId));
  }, []);

  const addBooking = useCallback((bookingDetails: BookingRequest) => {
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      status: BookingStatus.Pending,
      ...bookingDetails,
    };
    setBookings(prevBookings => [...prevBookings, newBooking]);
  }, []);
  
  const deleteBooking = useCallback((bookingId: string) => {
    setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));
  }, []);

  const updateBookingStatus = useCallback((bookingId: string, status: BookingStatus, rejectionReason?: string) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status, rejectionReason: status === BookingStatus.Rejected ? rejectionReason : undefined }
          : booking
      )
    );
  }, []);
  
  const handleSetUserRole = (role: UserRole) => {
    if (role !== UserRole.Admin && loggedInUser) {
      handleLogout();
    }
    setUserRole(role);
  }

  return (
    <div className="bg-gray-100 min-h-screen text-gray-800">
      <Header userRole={userRole} setUserRole={handleSetUserRole} loggedInUser={loggedInUser} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 lg:p-8">
        {userRole === UserRole.Admin ? (
          loggedInUser ? (
            <AdminView 
              rooms={rooms} 
              addRoom={addRoom} 
              deleteRoom={deleteRoom} 
              bookings={bookings}
              updateBookingStatus={updateBookingStatus}
              admins={admins}
              addAdmin={addAdmin}
              updateAdmin={updateAdmin}
            />
          ) : (
            <LoginView onLogin={handleLogin} />
          )
        ) : (
          <ClubPresidentView rooms={rooms} bookings={bookings} addBooking={addBooking} />
        )}
      </main>
    </div>
  );
};

export default App;
