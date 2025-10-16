import React, { useState, useMemo, useEffect } from 'react';
import { Room, Booking, CalendarSlot, BookingStatus, BookingRequest } from '../types';
import BookingModal from './BookingModal';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ClubPresidentViewProps {
  rooms: Room[];
  bookings: Booking[];
  addBooking: (bookingDetails: BookingRequest) => void;
}

const ClubPresidentView: React.FC<ClubPresidentViewProps> = ({ rooms, bookings, addBooking }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const activeBookings = useMemo(() => {
    // Show only pending and approved bookings on the calendar
    return bookings.filter(b => b.status === BookingStatus.Approved || b.status === BookingStatus.Pending);
  }, [bookings]);

  const bookedSlots = useMemo(() => {
    const lookup = new Map<string, Booking>();
    activeBookings.forEach(b => {
      lookup.set(`${b.roomId}-${b.date}`, b);
    });
    return lookup;
  }, [activeBookings]);

  const handleSlotClick = (room: Room, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    // Prevent booking if a slot is already taken (pending or approved)
    if (bookedSlots.has(`${room.id}-${dateStr}`)) {
        return;
    }
    setSelectedSlot({ room, date: dateStr });
    setIsModalOpen(true);
  };

  const handleBookingConfirm = (bookingRequest: BookingRequest) => {
    if (selectedSlot) {
      addBooking(bookingRequest);
      setIsModalOpen(false);
      setSelectedSlot(null);
    }
  };
  
  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
        const newDate = new Date(prev);
        newDate.setDate(1); // Set to 1st to avoid month skipping issues
        newDate.setMonth(newDate.getMonth() + offset);
        return newDate;
    });
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    const firstOfView = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const firstOfToday = new Date(today.getFullYear(), today.getMonth(), 1);
    if (firstOfView < firstOfToday) {
      setCurrentMonth(new Date());
    }
  }, [currentMonth, today]);
  
  const canGoBack = useMemo(() => {
    const firstOfView = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const firstOfToday = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstOfView > firstOfToday;
  }, [currentMonth, today]);

  const daysArray = useMemo(() => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const isCurrentDisplayMonth = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();
    
    if (isCurrentDisplayMonth) {
        return allDays.filter(day => day >= today.getDate());
    }
    return allDays;
  }, [currentMonth, today]);


  return (
    <div>
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-md">
         <button
            onClick={() => changeMonth(-1)}
            disabled={!canGoBack}
            className="p-2 rounded-full hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="الشهر السابق"
          >
            <ChevronRightIcon />
         </button>
         <h2 className="text-xl font-bold text-gray-700">
           {currentMonth.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
         </h2>
         <button 
            onClick={() => changeMonth(1)} 
            className="p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="الشهر التالي"
          >
            <ChevronLeftIcon />
         </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        {daysArray.length > 0 ? (
            <table className="w-full border-collapse min-w-[1200px] lg:min-w-full">
               <thead>
                 <tr className="bg-gray-50">
                   <th className="p-3 text-right font-semibold text-gray-700 border sticky right-0 bg-gray-100 z-10 w-[150px] md:w-[200px]">القاعة</th>
                   {daysArray.map(dayNum => {
                       const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                       return (
                         <th key={dayNum} className="p-2 text-center font-medium border w-28 md:w-32 text-gray-600">
                           <span className="text-sm">{date.toLocaleDateString('ar-EG', { weekday: 'short'})}</span>
                           <br/>
                           {dayNum}
                         </th>
                       )
                   })}
                 </tr>
               </thead>
               <tbody>
                 {rooms.map(room => (
                   <tr key={room.id} className="border-t">
                     <td className="p-3 font-semibold border-l border-b sticky right-0 bg-white z-[5]">{room.name}</td>
                     {daysArray.map(dayNum => {
                        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
                        const dateStr = date.toISOString().split('T')[0];
                        const bookingInfo = bookedSlots.get(`${room.id}-${dateStr}`);
                        
                        const cellClasses = `p-1 border-r border-b text-center align-middle h-20`;

                        if (bookingInfo) {
                          const isPending = bookingInfo.status === BookingStatus.Pending;
                          const bgColor = isPending ? 'bg-yellow-100' : 'bg-red-100';
                          const textColor = isPending ? 'text-yellow-800' : 'text-red-800';
                          const statusText = isPending ? 'قيد الانتظار' : 'محجوزة';

                          return (
                            <td key={dateStr} className={cellClasses}>
                              <div className={`${bgColor} ${textColor} p-2 rounded-md h-full flex flex-col justify-center items-center text-sm font-bold`} title={statusText}>
                                 <p>{statusText}</p>
                              </div>
                            </td>
                          );
                        }
                        
                        return (
                          <td key={dateStr} className={cellClasses}>
                            <div className="h-full flex items-center justify-center p-1">
                              <button
                                onClick={() => handleSlotClick(room, date)}
                                className="bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-md hover:bg-green-200 transition-colors text-sm w-full h-full"
                              >
                                طلب حجز
                              </button>
                            </div>
                          </td>
                        );
                     })}
                   </tr>
                 ))}
               </tbody>
            </table>
        ) : (
            <div className="p-10 text-center text-gray-500">
                لا توجد أيام متاحة للحجز في هذا الشهر.
            </div>
        )}
      </div>
      
      {selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleBookingConfirm}
          slotInfo={selectedSlot}
        />
      )}
    </div>
  );
};

export default ClubPresidentView;
