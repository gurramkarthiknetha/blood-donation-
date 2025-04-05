import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Paper
} from '@mui/material';
import { LineChart, PieChart } from '@mui/x-charts';
import { adminAPI } from '../../services/adminAPI';

interface DashboardStats {
  totalHospitals: number;
  totalDonors: number;
  requestStats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

interface BloodRequest {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  request: {
    bloodType: string;
    quantity: number;
    status: string;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, requestsData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAllRequests()
      ]);

      setStats(statsData);
      setBloodRequests(requestsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, hospitalId: string) => {
    try {
      await adminAPI.approveRequest(requestId, hospitalId);
      fetchDashboardData();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string, hospitalId: string) => {
    try {
      await adminAPI.rejectRequest(requestId, hospitalId, 'Request rejected by admin');
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Hospitals</Typography>
              <Typography variant="h3">{stats?.totalHospitals}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Donors</Typography>
              <Typography variant="h3">{stats?.totalDonors}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pending Requests</Typography>
              <Typography variant="h3">{stats?.requestStats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom component="div">
              Recent Blood Requests
            </Typography>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Hospital</TableCell>
                    <TableCell>Blood Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bloodRequests.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell>{req.hospitalName}</TableCell>
                      <TableCell>{req.request.bloodType}</TableCell>
                      <TableCell>{req.request.quantity}</TableCell>
                      <TableCell>{req.request.status}</TableCell>
                      <TableCell>
                        {req.request.status === 'pending' && (
                          <Box>
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => handleApproveRequest(req._id, req.hospitalId)}
                              sx={{ mr: 1 }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRejectRequest(req._id, req.hospitalId)}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Blood Request Trends</Typography>
            <LineChart
              xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7] }]}
              series={[
                {
                  data: [2, 5, 3, 7, 4, 6, 8],
                  area: true,
                },
              ]}
              height={300}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Blood Type Distribution</Typography>
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: 10, label: 'A+' },
                    { id: 1, value: 15, label: 'B+' },
                    { id: 2, value: 20, label: 'O+' },
                    { id: 3, value: 5, label: 'AB+' },
                  ],
                },
              ]}
              height={300}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;