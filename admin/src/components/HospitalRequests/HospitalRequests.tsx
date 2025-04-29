import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography
} from '@mui/material';
import { adminAPI } from '../../services/adminAPI';

interface BloodRequest {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  bloodType: string;
  quantity: number;
  urgency: string;
  status: string;
  requestDate: string;
}

const HospitalRequests: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch requests from static backend endpoint
  const fetchRequests = async () => {
    try {
      // Use static endpoint to get all blood requests
      const data = await adminAPI.getAllRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Handle request approval using static backend endpoint
  const handleApprove = async (request: BloodRequest) => {
    try {
      // Call static endpoint to approve request
      await adminAPI.approveRequest(request._id, request.hospitalId);
      // Refresh requests from static endpoint
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectClick = (request: BloodRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  // Handle request rejection confirmation using static backend endpoint
  const handleRejectConfirm = async () => {
    if (selectedRequest && rejectReason) {
      try {
        // Call static endpoint to reject request
        await adminAPI.rejectRequest(selectedRequest._id, selectedRequest.hospitalId, rejectReason);
        // Reset UI state
        setRejectDialogOpen(false);
        setRejectReason('');
        setSelectedRequest(null);
        // Refresh requests from static endpoint
        fetchRequests();
      } catch (error) {
        console.error('Error rejecting request:', error);
      }
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" gutterBottom>Blood Requests Management</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hospital</TableCell>
              <TableCell>Blood Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Urgency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>{request.hospitalName}</TableCell>
                <TableCell>{request.bloodType}</TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>{request.urgency}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <Box>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => handleApprove(request)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRejectClick(request)}
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

      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Blood Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for rejection"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} color="error">
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HospitalRequests;