import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiService } from '../services/apiService';
import './NotificationComponent.css';

export const NotificationComponent = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  useWebSocket('notification', (data) => {
    setNotifications(prev => [data, ...prev]);
    setUnreadCount(prev => prev + 1);
  });

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (ids) => {
    try {
      await apiService.markNotificationsAsRead(ids);
      setNotifications(notifications.map(n => 
        ids.includes(n.id) ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => prev - ids.length);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  return (
    <div className="notification-component">
      <button 
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead(notifications
                  .filter(n => !n.read)
                  .map(n => n.id))}
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => !notification.read && markAsRead([notification.id])}
                >
                  <div className="notification-content">
                    {notification.message}
                  </div>
                  <div className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};