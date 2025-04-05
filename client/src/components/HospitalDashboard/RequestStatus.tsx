import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography
} from '@mui/material';

interface BloodRequest {
  _id: string;
  bloodType: string;
  quantity: number;
  urgency: string;
  status: string;
  requestDate: string;
  notes?: string;
}

interface RequestStatusProps {
  requests: BloodRequest[];
}

const RequestStatus: React.FC<RequestStatusProps> = ({ requests }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Blood Request Status
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Blood Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Urgency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request._id}>
                <TableCell>
                  {new Date(request.requestDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{request.bloodType}</TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>
                  <Chip
                    label={request.urgency}
                    color={request.urgency === 'high' ? 'error' : 
                           request.urgency === 'medium' ? 'warning' : 'info'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{request.notes || '-'}</TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RequestStatus;