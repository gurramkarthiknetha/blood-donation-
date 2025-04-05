import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import NotificationBadge from './NotificationBadge';
import Notifications from './Notifications';
import { hospitalService } from '../../services/hospitalService';

interface DashboardHeaderProps {
  hospitalName: string;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  hospitalName,
  onLogout
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    unreadNotifications: 0,
    lowInventoryCount: 0
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const [requests, inventory] = await Promise.all([
        hospitalService.getBloodRequests(),
        hospitalService.getBloodInventory()
      ]);

      setStats({
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
        unreadNotifications: 0, // Will be updated by Notifications component
        lowInventoryCount: inventory.filter((i: any) => i.quantity <= 10).length
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationUpdate = (unreadCount: number) => {
    setStats(prev => ({ ...prev, unreadNotifications: unreadCount }));
  };

  return (
    <AppBar position="static" color="default">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          {hospitalName}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationBadge
            pendingRequests={stats.pendingRequests}
            unreadNotifications={stats.unreadNotifications}
            lowInventoryCount={stats.lowInventoryCount}
          />

          <Notifications onUnreadCountChange={handleNotificationUpdate} />

          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={onLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;