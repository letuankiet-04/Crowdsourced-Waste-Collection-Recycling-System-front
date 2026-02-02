import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SidebarLogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    // Implement logout logic here
    navigate('/auth/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center px-4 py-3.5 text-base font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200 ease-in-out hover:translate-x-1 hover:scale-[1.02] mt-2"
    >
      <LogOut className="h-6 w-6 mr-3" />
      Logout
    </button>
  );
}
