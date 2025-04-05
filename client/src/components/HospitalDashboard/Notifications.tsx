import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Badge,
  Popover,
  Paper
} from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { hospitalService } from '../../services/hospitalService';

interface Notification {
  id: string;
  message: string;
  type: 'request_approved' | 'request_rejected' | 'inventory_low';
  timestamp: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await hospitalService.getNotifications();
      setNotifications(response);
      setUnreadCount(response.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    markAllAsRead();
  };

  const markAllAsRead = async () => {
    try {
      await hospitalService.markNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'request_approved':
        return 'success.main';
      case 'request_rejected':
        return 'error.main';
      case 'inventory_low':
        return 'warning.main';
      default:
        return 'text.primary';
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={handleNotificationClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Paper sx={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Notifications</Typography>
          </Box>
          <List>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem key={notification.id} divider>
                  <ListItemText
                    primary={notification.message}
                    secondary={new Date(notification.timestamp).toLocaleString()}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: notification.read ? 'text.primary' : getNotificationColor(notification.type),
                        fontWeight: notification.read ? 'normal' : 'bold'
                      }
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No notifications" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Popover>
    </>
  );
};

export default Notifications;