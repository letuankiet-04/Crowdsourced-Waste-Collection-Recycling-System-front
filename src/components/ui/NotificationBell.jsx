import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, subscribeNotifications } from '../../api/notifications';
import useStoredUser from '../../hooks/useStoredUser';
import { PATHS } from '../../routes/paths';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user, roleLabel } = useStoredUser();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await getNotifications(user?.id);
      setNotifications(data);
    };
    loadNotifications();

    const unsubscribe = subscribeNotifications((updated) => {
      setNotifications([...updated]);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    setIsOpen(false);

    // Navigate based on role and notification type
    if (roleLabel === 'enterprise') {
        navigate(PATHS.enterprise.reportDetail.replace(':reportId', notification.reportId));
    } else if (roleLabel === 'citizen') {
        navigate(PATHS.citizen.reportDetail.replace(':reportId', notification.reportId));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'NEW_REPORT': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'REPORT_ACCEPTED': return <Check className="w-4 h-4 text-green-500" />;
      case 'REPORT_REJECTED': return <X className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-full transition-all duration-200"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                    !notification.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      !notification.isRead ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-100'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      {notification.reason && (
                        <p className="text-xs text-red-500 mt-1 bg-red-50 p-1.5 rounded-md border border-red-100">
                           Reason: {notification.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()} • {new Date(notification.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
