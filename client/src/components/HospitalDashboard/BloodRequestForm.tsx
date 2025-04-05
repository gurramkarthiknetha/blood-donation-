import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Paper,
  Typography
} from '@mui/material';

interface BloodRequestFormProps {
  onSubmit: (request: any) => Promise<void>;
}

const BloodRequestForm: React.FC<BloodRequestFormProps> = ({ onSubmit }) => {
  const [bloodType, setBloodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await onSubmit({
        bloodType,
        quantity: Number(quantity),
        urgency,
        notes
      });
      
      setSuccess('Blood request submitted successfully');
      // Reset form
      setBloodType('');
      setQuantity('');
      setUrgency('');
      setNotes('');
    } catch (err) {
      setError('Failed to submit blood request');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Submit Blood Request
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Blood Type</InputLabel>
          <Select
            value={bloodType}
            label="Blood Type"
            onChange={(e: SelectChangeEvent) => setBloodType(e.target.value)}
            required
          >
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Quantity (units)"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Urgency Level</InputLabel>
          <Select
            value={urgency}
            label="Urgency Level"
            onChange={(e: SelectChangeEvent) => setUrgency(e.target.value)}
            required
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Additional Notes"
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          Submit Request
        </Button>
      </Box>
    </Paper>
  );
};

export default BloodRequestForm;