import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { hospitalService } from '../../services/hospitalService';

interface DonationEventListProps {
  onEventStatusChange: () => void;
}

const DonationEventList: React.FC<DonationEventListProps> = ({
  onEventStatusChange
}) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [donorsDialogOpen, setDonorsDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await hospitalService.getDonationEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      await hospitalService.updateEventStatus(eventId, newStatus);
      fetchEvents();
      onEventStatusChange();
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const handleDonorStatusUpdate = async (
    eventId: string,
    donorId: string,
    status: string
  ) => {
    try {
      await hospitalService.updateDonorStatus(eventId, donorId, status);
      fetchEvents();
    } catch (error) {
      console.error('Error updating donor status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Donation Events
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event: any) => (
              <TableRow key={event._id}>
                <TableCell>
                  {new Date(event.date).toLocaleDateString()}
                  <br />
                  {new Date(event.date).toLocaleTimeString()}
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>{event.capacity}</TableCell>
                <TableCell>
                  {event.registeredDonors.length}/{event.capacity}
                </TableCell>
                <TableCell>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {event.status === 'upcoming' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleStatusChange(event._id, 'ongoing')}
                      >
                        Start
                      </Button>
                    )}
                    {event.status === 'ongoing' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleStatusChange(event._id, 'completed')}
                      >
                        Complete
                      </Button>
                    )}
                    {(event.status === 'upcoming' || event.status === 'ongoing') && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleStatusChange(event._id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedEvent(event);
                        setDonorsDialogOpen(true);
                      }}
                    >
                      <PeopleIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={donorsDialogOpen}
        onClose={() => setDonorsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Registered Donors</DialogTitle>
        <DialogContent>
          <List>
            {selectedEvent?.registeredDonors.map((registration: any) => (
              <ListItem
                key={registration.donorId._id}
                secondaryAction={
                  selectedEvent.status === 'ongoing' && (
                    <Box>
                      <IconButton
                        edge="end"
                        color="success"
                        onClick={() => handleDonorStatusUpdate(
                          selectedEvent._id,
                          registration.donorId._id,
                          'completed'
                        )}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDonorStatusUpdate(
                          selectedEvent._id,
                          registration.donorId._id,
                          'cancelled'
                        )}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  )
                }
              >
                <ListItemText
                  primary={registration.donorId.name}
                  secondary={`${registration.bloodType} | ${registration.status}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDonorsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DonationEventList;