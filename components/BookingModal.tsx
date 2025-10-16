import React, { useState, useEffect } from 'react';
import { CalendarSlot, BookingRequest } from '../types';
import { CalendarIcon, CloseIcon } from './Icons';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingRequest: BookingRequest) => void;
  slotInfo: CalendarSlot;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onConfirm, slotInfo }) => {
  const [requesterType, setRequesterType] = useState<'ClubPresident' | 'Student'>('ClubPresident');
  const [clubName, setClubName] = useState('');
  const [activityName, setActivityName] = useState('');
  const [reason, setReason] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const resetForm = () => {
      setRequesterType('ClubPresident');
      setClubName('');
      setActivityName('');
      setReason('');
      setRequesterName('');
      setUniversityId('');
      setEmail('');
      setContactNumber('');
  }

  useEffect(() => {
    if (isOpen) {
        resetForm();
    }
  }, [isOpen]);

  const isFormValid = () => {
      if (!activityName.trim() || !requesterName.trim() || !universityId.trim() || !email.trim() || !contactNumber.trim()) {
          return false;
      }
      if (requesterType === 'Student' && !reason.trim()) {
          return false;
      }
      if (requesterType === 'ClubPresident' && !clubName.trim()) {
          return false;
      }
      return true;
  }

  const handleSubmit = () => {
    if (isFormValid()) {
      onConfirm({
        roomId: slotInfo.room.id,
        date: slotInfo.date,
        requesterType,
        clubName: requesterType === 'ClubPresident' ? clubName : 'N/A',
        activityName,
        reason: requesterType === 'Student' ? reason : undefined,
        requesterName,
        universityId,
        email,
        contactNumber,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4 transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">طلب حجز قاعة</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon />
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-6">
            <p className="font-semibold text-lg">{slotInfo.room.name}</p>
            <div className="flex items-center gap-2 mt-2 text-sm">
                <CalendarIcon />
                <span>{new Date(slotInfo.date + 'T00:00:00').toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">صفة مقدم الطلب</label>
            <div className="flex gap-4">
                <label className="flex items-center">
                    <input type="radio" name="requesterType" value="ClubPresident" checked={requesterType === 'ClubPresident'} onChange={() => setRequesterType('ClubPresident')} className="ml-2"/>
                    رئيس نادي
                </label>
                <label className="flex items-center">
                    <input type="radio" name="requesterType" value="Student" checked={requesterType === 'Student'} onChange={() => setRequesterType('Student')} className="ml-2"/>
                    طالب
                </label>
            </div>
          </div>

          {requesterType === 'ClubPresident' && (
            <div>
                <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 mb-1">اسم النادي</label>
                <input id="clubName" type="text" value={clubName} onChange={(e) => setClubName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
            </div>
          )}
          
          <div>
            <label htmlFor="activityName" className="block text-sm font-medium text-gray-700 mb-1">اسم النشاط</label>
            <input id="activityName" type="text" value={activityName} onChange={(e) => setActivityName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
          </div>

          {requesterType === 'Student' && (
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">سبب الحجز</label>
              <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" rows={3} required />
            </div>
          )}

          <hr className="my-4"/>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input id="requesterName" type="text" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required/>
              </div>
              <div>
                <label htmlFor="universityId" className="block text-sm font-medium text-gray-700 mb-1">الرقم الجامعي</label>
                <input id="universityId" type="text" value={universityId} onChange={(e) => setUniversityId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required/>
              </div>
               <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required/>
              </div>
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">رقم التواصل</label>
                <input id="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required/>
              </div>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <p className="text-sm text-center text-gray-800">
                <strong>ملاحظة هامة:</strong> يلتزم مقدم الطلب بالمحافظة على نظافة القاعة وتجهيزاتها، وتسليمها بنفس الحالة التي استلمها بها عند انتهاء النشاط.
            </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
          <button onClick={handleSubmit} disabled={!isFormValid()} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition">
            إرسال الطلب
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;