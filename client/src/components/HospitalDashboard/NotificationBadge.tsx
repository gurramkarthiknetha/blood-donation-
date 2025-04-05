import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccessTime as PendingIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface NotificationBadgeProps {
  pendingRequests: number;
  unreadNotifications: number;
  lowInventoryCount: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  pendingRequests,
  unreadNotifications,
  lowInventoryCount
}) => {
  return (
    <Stack direction="row" spacing={2}>
      {pendingRequests > 0 && (
        <Chip
          icon={<PendingIcon />}
          label={`${pendingRequests} Pending`}
          color="primary"
          variant="outlined"
        />
      )}
      
      {unreadNotifications > 0 && (
        <Chip
          icon={<NotificationsIcon />}
          label={`${unreadNotifications} New`}
          color="info"
          variant="outlined"
        />
      )}
      
      {lowInventoryCount > 0 && (
        <Chip
          icon={<WarningIcon />}
          label={`${lowInventoryCount} Low Stock`}
          color="warning"
          variant="outlined"
        />
      )}
      
      {pendingRequests === 0 && unreadNotifications === 0 && lowInventoryCount === 0 && (
        <Typography variant="body2" color="text.secondary">
          No pending notifications
        </Typography>
      )}
    </Stack>
  );
};

export default NotificationBadge;