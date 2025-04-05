import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { hospitalService } from '../../services/hospitalService';

interface DonationEventProps {
  onEventCreated: () => void;
}

const DonationEvent: React.FC<DonationEventProps> = ({ onEventCreated }) => {
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [bloodTypesNeeded, setBloodTypesNeeded] = useState({
    'A+': false, 'A-': false,
    'B+': false, 'B-': false,
    'AB+': false, 'AB-': false,
    'O+': false, 'O-': false
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!eventDate || !location || !capacity) {
      setError('Please fill in all required fields');
      return;
    }

    const selectedBloodTypes = Object.entries(bloodTypesNeeded)
      .filter(([_, needed]) => needed)
      .map(([type]) => type);

    if (selectedBloodTypes.length === 0) {
      setError('Please select at least one blood type');
      return;
    }

    try {
      await hospitalService.createDonationEvent({
        date: eventDate,
        location,
        description,
        capacity: parseInt(capacity),
        bloodTypesNeeded: selectedBloodTypes
      });

      setSuccess('Donation event created successfully');
      setEventDate(null);
      setLocation('');
      setDescription('');
      setCapacity('');
      setBloodTypesNeeded({
        'A+': false, 'A-': false,
        'B+': false, 'B-': false,
        'AB+': false, 'AB-': false,
        'O+': false, 'O-': false
      });
      onEventCreated();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error creating donation event');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Schedule Blood Donation Event
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <DateTimePicker
              label="Event Date & Time"
              value={eventDate}
              onChange={(newValue) => setEventDate(newValue)}
              slotProps={{ textField: { fullWidth: true, required: true } }}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Capacity (donors)"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Blood Types Needed
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(bloodTypesNeeded).map(([type, checked]) => (
                <Grid item xs={3} key={type}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(e) => setBloodTypesNeeded(prev => ({
                          ...prev,
                          [type]: e.target.checked
                        }))}
                      />
                    }
                    label={type}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            {success}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 2 }}
        >
          Create Event
        </Button>
      </Box>
    </Paper>
  );
};

export default DonationEvent;