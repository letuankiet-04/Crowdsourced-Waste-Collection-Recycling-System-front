// Mock Notification Store
let MOCK_NOTIFICATIONS = [
  {
    id: 1,
    receiverId: 2, // Enterprise
    senderId: 1, // Citizen
    reportId: 101,
    type: 'NEW_REPORT',
    message: 'New report submitted by Citizen',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    receiverId: 1, // Citizen
    senderId: 2, // Enterprise
    reportId: 100,
    type: 'REPORT_ACCEPTED',
    message: 'Your report #WR-2023-001 has been accepted.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let listeners = [];

const notifyListeners = () => {
  listeners.forEach(l => l(MOCK_NOTIFICATIONS));
};

export const subscribeNotifications = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

export const getNotifications = async (userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  if (userId == null) return MOCK_NOTIFICATIONS;
  const receiverId = Number(userId);
  return MOCK_NOTIFICATIONS.filter(n => n.receiverId === receiverId);
};

export const markAsRead = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map(n => 
    n.id === id ? { ...n, isRead: true } : n
  );
  notifyListeners();
  return { success: true };
};

export const getUnreadCount = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  if (userId == null) return MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
  const receiverId = Number(userId);
  return MOCK_NOTIFICATIONS.filter(n => n.receiverId === receiverId && !n.isRead).length;
};

export const createNotification = async (notification) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newNotification = {
    id: Date.now(),
    isRead: false,
    createdAt: new Date().toISOString(),
    ...notification
  };
  MOCK_NOTIFICATIONS = [newNotification, ...MOCK_NOTIFICATIONS];
  notifyListeners();
  return newNotification;
};
