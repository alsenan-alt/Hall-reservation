import React, { useState } from 'react';
import { Room, Booking, BookingStatus, AdminUser, RoomStatus } from '../types';
import { PlusIcon, TrashIcon, CheckIcon, XIcon, UserIcon, LockIcon, PencilIcon, CloseIcon, WrenchIcon, PlayIcon } from './Icons';
import { GoogleGenAI } from '@google/genai';

// --- Components ---

interface AdminViewProps {
  rooms: Room[];
  bookings: Booking[];
  addRoom: (roomName: string) => void;
  deleteRoom: (roomId: string) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus, rejectionReason?: string) => void;
  deleteBooking: (bookingId: string) => void;
  admins: AdminUser[];
  addAdmin: (username: string, password: string) => void;
  updateAdmin: (adminId: string, newUsername: string, newPassword?: string) => void;
}

const AddRoomForm: React.FC<{ addRoom: (roomName: string) => void }> = ({ addRoom }) => {
  const [newRoomName, setNewRoomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRoom(newRoomName);
    setNewRoomName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
      <input
        type="text"
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
        placeholder="اسم القاعة الجديدة"
        className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        required
      />
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2 disabled:bg-blue-300"
        disabled={!newRoomName.trim()}
      >
        <PlusIcon />
        إضافة قاعة
      </button>
    </form>
  );
};

const AddAdminForm: React.FC<{ addAdmin: (u: string, p: string) => void }> = ({ addAdmin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addAdmin(username, password);
        setUsername('');
        setPassword('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم الجديد</label>
                <div className="relative">
                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <UserIcon />
                    </div>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="مثال: supervisor2" className="w-full p-3 pr-10 border border-gray-300 rounded-lg" required />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <LockIcon />
                    </div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 pr-10 border border-gray-300 rounded-lg" required />
                </div>
            </div>
            <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:bg-indigo-300"
                disabled={!username.trim() || !password.trim()}
            >
                <PlusIcon />
                إضافة مسؤول
            </button>
        </form>
    );
};

const BookingRequestCard: React.FC<{
  booking: Booking;
  roomName: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
}> = ({ booking, roomName, onApprove, onReject }) => {
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirmRejection = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
    }
  };

  const handleCancelRejection = () => {
    setShowRejectionInput(false);
    setRejectionReason('');
  };

  return (
     <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200 transition-shadow hover:shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-lg text-blue-700">{roomName}</h4>
                <p className="text-sm text-gray-500">{new Date(booking.date + 'T00:00:00').toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <span className="text-sm font-medium bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">قيد الانتظار</span>
        </div>
        <div className="mt-4 pt-4 border-t">
            <p className="text-sm"><span className="font-semibold">النشاط:</span> {booking.activityName}</p>
            <p className="text-sm"><span className="font-semibold">مقدم الطلب:</span> {booking.requesterName} ({booking.requesterType === 'Student' ? 'طالب' : 'رئيس نادي'})</p>
            {booking.requesterType === 'Student' && booking.reason && (
                 <p className="text-sm mt-1 bg-gray-50 p-2 rounded-md"><span className="font-semibold">السبب:</span> {booking.reason}</p>
            )}
            <p className="text-sm"><span className="font-semibold">البريد الإلكتروني:</span> {booking.email}</p>
        </div>
        
        {showRejectionInput && (
            <div className="mt-4 transition-all duration-300 ease-in-out">
                <label htmlFor={`reason-${booking.id}`} className="block text-sm font-medium text-gray-700 mb-1">سبب الرفض:</label>
                <textarea
                    id={`reason-${booking.id}`}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="يرجى توضيح سبب رفض الطلب..."
                />
            </div>
        )}

        <div className="flex gap-3 mt-4 pt-4 border-t">
            {showRejectionInput ? (
                <>
                    <button
                        onClick={handleCancelRejection}
                        className="flex-1 bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                    >
                        تراجع
                    </button>
                    <button
                        onClick={handleConfirmRejection}
                        disabled={!rejectionReason.trim()}
                        className="flex-1 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:bg-red-300"
                    >
                        <XIcon/> تأكيد الرفض
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={onApprove}
                        className="flex-1 bg-green-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                        <CheckIcon/> موافقة
                    </button>
                    <button
                        onClick={() => setShowRejectionInput(true)}
                        className="flex-1 bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                    >
                        <XIcon/> رفض
                    </button>
                </>
            )}
        </div>
    </div>
  );
};

const EditAdminModal: React.FC<{
  admin: AdminUser;
  onClose: () => void;
  onSave: (adminId: string, newUsername: string, newPassword?: string) => void;
}> = ({ admin, onClose, onSave }) => {
  const [username, setUsername] = useState(admin.username);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(admin.id, username, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">تعديل بيانات المسؤول</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><CloseIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة (اختياري)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="اتركه فارغاً لعدم التغيير" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">حفظ التغييرات</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main View ---

const AdminView: React.FC<AdminViewProps> = ({ rooms, bookings, addRoom, deleteRoom, updateRoomStatus, updateBookingStatus, deleteBooking, admins, addAdmin, updateAdmin }) => {
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const pendingBookings = bookings.filter(b => b.status === BookingStatus.Pending);
  const roomMap = new Map(rooms.map(room => [room.id, room.name]));

  const generateAndNotify = async (booking: Booking, status: 'Approved' | 'Rejected', reason?: string) => {
      try {
        if (!process.env.API_KEY) {
            console.warn("API key not found. Skipping email notification.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const bookingDate = new Date(booking.date + 'T00:00:00').toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        const roomName = roomMap.get(booking.roomId);

        let prompt;

        if (status === 'Approved') {
          // Dedicated prompt for approval as requested by the user
          prompt = `
            أنت مساعد إداري في جامعة، ومهمتك هي كتابة بريد إلكتروني احترافي ومفصل لتأكيد حجز قاعة بنجاح.
            البريد يجب أن يكون باللغة العربية، ودودًا وواضحًا.

            موضوع البريد: تمت الموافقة على طلب حجز قاعة: ${booking.activityName}

            محتوى البريد:
            1.  ابدأ بتحية شخصية للمستخدم: "عزيزي/عزيزتي ${booking.requesterName}،"
            2.  أبلغه بالخبر السار مباشرة، وهو أنه تمت الموافقة على طلبه لحجز قاعة.
            3.  اعرض تفاصيل الحجز المؤكدة التالية في قائمة منظمة وواضحة:
                - **القاعة:** ${roomName}
                - **النشاط:** ${booking.activityName}
                - **التاريخ:** ${bookingDate}
            4.  أضف هذه الملاحظة الهامة في النهاية: "يرجى الالتزام بقواعد استخدام القاعة والمحافظة على نظافتها وتسليمها بنفس الحالة التي تم استلامها بها."
            5.  اختم البريد بشكل رسمي ومهني: "مع تحيات، إدارة شؤون الطلاب."
          `;
        } else { // Rejected
          prompt = `
            أنت مساعد إداري في جامعة، ومهمتك هي كتابة بريد إلكتروني احترافي ولطيف لإعلام مستخدم برفض طلب حجز قاعة.
            البريد يجب أن يكون باللغة العربية.

            موضوع البريد: تحديث بخصوص طلب حجز قاعة: ${booking.activityName}

            محتوى البريد:
            1. ابدأ بتحية شخصية للمستخدم: "عزيزي/عزيزتي ${booking.requesterName}،"
            2. أبلغه بالرفض بلطف، موضحًا أن الطلب الخاص بنشاط "${booking.activityName}" قد تم رفضه.
            3. اذكر سبب الرفض بوضوح: "السبب: ${reason}"
            4. أضف جملة لطيفة مثل: "نتمنى لك حظًا أوفر في المرات القادمة."
            5. اختم البريد بشكل رسمي: "مع تحيات، إدارة شؤون الطلاب."
          `;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const emailContent = response.text;
        console.log(`--- Simulation: Email sent to ${booking.email} ---\n${emailContent}`);
        // In a real app, you would use an email service here.

      } catch (error) {
          console.error("Error generating email:", error);
          alert("حدث خطأ أثناء إنشاء البريد الإلكتروني. سيتم تحديث الحالة ولكن قد لا يتم إرسال الإشعار.");
      }
  };

  const handleApprove = (booking: Booking) => {
    // Optimistic UI Update
    updateBookingStatus(booking.id, BookingStatus.Approved);
    // Fire-and-forget notification
    generateAndNotify(booking, 'Approved').catch(err => {
        console.error("Failed to send approval notification for booking:", booking.id, err);
    });
  };
  
  const handleReject = (booking: Booking, reason: string) => {
    // Send notification first, then delete.
    generateAndNotify(booking, 'Rejected', reason).catch(err => {
        console.error("Failed to send rejection notification for booking:", booking.id, err);
    });
    deleteBooking(booking.id);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Requests Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">طلبات الحجز المعلقة</h2>
            {pendingBookings.length > 0 ? (
              <div className="space-y-4">
                {pendingBookings.map(booking => (
                  <BookingRequestCard
                    key={booking.id}
                    booking={booking}
                    roomName={roomMap.get(booking.roomId) || 'قاعة غير معروفة'}
                    onApprove={() => handleApprove(booking)}
                    onReject={(reason) => handleReject(booking, reason)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6">لا توجد طلبات حجز معلقة حالياً.</p>
            )}
          </div>
        </div>

        {/* Management Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">إدارة القاعات</h2>
            <AddRoomForm addRoom={addRoom} />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-600 border-b pb-2">قائمة القاعات الحالية</h3>
              {rooms.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {rooms.map(room => (
                    <li key={room.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center">
                          <span className="text-gray-800">{room.name}</span>
                          {room.status === RoomStatus.UnderMaintenance && (
                            <span className="text-xs font-semibold mr-2 px-2.5 py-0.5 rounded bg-orange-200 text-orange-800">تحت الصيانة</span>
                          )}
                      </div>
                      <div className="flex items-center gap-1">
                          {room.status === RoomStatus.Available ? (
                              <button
                                  onClick={() => updateRoomStatus(room.id, RoomStatus.UnderMaintenance)}
                                  className="text-orange-500 hover:text-orange-700 p-2 rounded-full hover:bg-orange-100 transition-colors duration-200"
                                  aria-label={`وضع ${room.name} تحت الصيانة`}
                                  title="وضع تحت الصيانة"
                              >
                                  <WrenchIcon />
                              </button>
                          ) : (
                              <button
                                  onClick={() => updateRoomStatus(room.id, RoomStatus.Available)}
                                  className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-100 transition-colors duration-200"
                                  aria-label={`إعادة تفعيل ${room.name}`}
                                  title="إعادة تفعيل"
                              >
                                  <PlayIcon />
                              </button>
                          )}
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors duration-200"
                            aria-label={`حذف ${room.name}`}
                          >
                            <TrashIcon />
                          </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">لا توجد قاعات حالياً.</p>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-700">إدارة المسؤولين</h2>
              <AddAdminForm addAdmin={addAdmin} />
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-600 border-b pb-2 mb-3">قائمة المسؤولين</h3>
                 {admins.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {admins.map(admin => (
                            <li key={admin.id} className="flex items-center justify-between py-3">
                                <span className="text-gray-800">{admin.username}</span>
                                <button
                                    onClick={() => setEditingAdmin(admin)}
                                    className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                    aria-label={`تعديل ${admin.username}`}
                                >
                                    <PencilIcon />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <p className="text-center text-gray-500 py-4">لا يوجد مسؤولون حالياً.</p>
                )}
              </div>
          </div>
        </div>
      </div>

      {editingAdmin && (
        <EditAdminModal 
            admin={editingAdmin} 
            onClose={() => setEditingAdmin(null)} 
            onSave={updateAdmin} 
        />
      )}
    </>
  );
};

export default AdminView;