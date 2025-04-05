import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Event, LocationOn, AccessTime } from '@mui/icons-material';
import { donorService } from '../../services/donorService';

const EventRegistration: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await donorService.getAvailableEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleRegister = async () => {
    try {
      await donorService.registerForEvent(selectedEvent._id);
      setSuccess('Successfully registered for the event');
      setRegistrationOpen(false);
      fetchEvents();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error registering for event');
    }
  };

  const isEventSoon = (date: string) => {
    const eventDate = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 3;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Available Donation Events
      </Typography>

      <Grid container spacing={3}>
        {events.map((event: any) => (
          <Grid item xs={12} md={6} lg={4} key={event._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {event.hospital.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Event sx={{ mr: 1 }} />
                  <Typography>
                    {new Date(event.date).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography>
                    {new Date(event.date).toLocaleTimeString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1 }} />
                  <Typography>{event.location}</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {event.description}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Blood Types Needed:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {event.bloodTypesNeeded.map((type: string) => (
                      <Chip
                        key={type}
                        label={type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Spots Available: {event.capacity - event.registeredDonors.length}/{event.capacity}
                </Typography>

                {isEventSoon(event.date) && (
                  <Chip
                    label="Coming Soon"
                    color="warning"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={event.registeredDonors.length >= event.capacity}
                  onClick={() => {
                    setSelectedEvent(event);
                    setRegistrationOpen(true);
                    setError('');
                  }}
                >
                  Register
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={registrationOpen}
        onClose={() => setRegistrationOpen(false)}
      >
        <DialogTitle>Confirm Registration</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography>
            Are you sure you want to register for this donation event?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please make sure you are available on{' '}
            {selectedEvent && new Date(selectedEvent.date).toLocaleString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationOpen(false)}>Cancel</Button>
          <Button onClick={handleRegister} variant="contained" color="primary">
            Confirm Registration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventRegistration;