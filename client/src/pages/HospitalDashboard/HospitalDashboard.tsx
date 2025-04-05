import React, { useState, useEffect } from 'react';
import { Container, Box, Tab, Tabs, AppBar, Toolbar } from '@mui/material';
import BloodRequestForm from '../../components/HospitalDashboard/BloodRequestForm';
import RequestStatus from '../../components/HospitalDashboard/RequestStatus';
import Notifications from '../../components/HospitalDashboard/Notifications';
import BloodInventory from '../../components/HospitalDashboard/BloodInventory';
import { hospitalService } from '../../services/hospitalService';
import { wsService } from '../../services/websocketService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const HospitalDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
    // Initialize WebSocket connection
    wsService.connect();

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = wsService.onNotification((notification) => {
      // Refresh data based on notification type
      if (notification.type === 'request_approved' || notification.type === 'request_rejected') {
        fetchRequests();
      } else if (notification.type === 'inventory_low') {
        // Handle low inventory notification
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await hospitalService.getBloodRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmitRequest = async (requestData: any) => {
    // eslint-disable-next-line no-useless-catch
    try {
      await hospitalService.submitBloodRequest(requestData);
      fetchRequests();
    } catch (error) {
      throw error;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="default">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="hospital dashboard tabs"
          >
            <Tab label="Blood Inventory" />
            <Tab label="New Request" />
            <Tab label="Request Status" />
          </Tabs>
          <Notifications />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <TabPanel value={tabValue} index={0}>
          <BloodInventory />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <BloodRequestForm onSubmit={handleSubmitRequest} />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <RequestStatus requests={requests} />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default HospitalDashboard;