import React from 'react';
import { UserRole, AdminUser } from '../types';
import { LogoutIcon } from './Icons';

interface HeaderProps {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  loggedInUser: AdminUser | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, setUserRole, loggedInUser, onLogout }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-700">
            نظام حجز قاعات الأنشطة الطلابية
          </h1>
          <div className="flex items-center gap-4">
            {loggedInUser && userRole === UserRole.Admin && (
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 hidden sm:inline">أهلاً، <strong>{loggedInUser.username}</strong></span>
                    <button
                        onClick={onLogout}
                        className="bg-red-500 text-white font-medium px-4 py-2 text-sm rounded-full hover:bg-red-600 transition flex items-center gap-2"
                        aria-label="تسجيل الخروج"
                    >
                        <LogoutIcon />
                        <span className="hidden md:inline">تسجيل الخروج</span>
                    </button>
                </div>
            )}
            <div className="flex items-center bg-gray-200 rounded-full p-1">
              <button
                onClick={() => setUserRole(UserRole.ClubPresident)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                  userRole === UserRole.ClubPresident
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                رئيس النادي
              </button>
              <button
                onClick={() => setUserRole(UserRole.Admin)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                  userRole === UserRole.Admin
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-300'
                }`}
              >
                مسؤول القاعات
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
