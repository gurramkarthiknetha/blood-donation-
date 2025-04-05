import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import { hospitalService } from '../../services/hospitalService';

interface BloodUsageProps {
  onUsageRecorded: () => void;
}

const BloodUsage: React.FC<BloodUsageProps> = ({ onUsageRecorded }) => {
  const [bloodType, setBloodType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!bloodType || !quantity) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await hospitalService.recordBloodUsage({
        bloodType,
        quantity: parseInt(quantity),
        notes
      });

      setSuccess('Blood usage recorded successfully');
      setBloodType('');
      setQuantity('');
      setNotes('');
      onUsageRecorded();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error recording blood usage');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Record Blood Usage
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
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

        <TextField
          fullWidth
          label="Notes"
          multiline
          rows={3}
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
          size="large"
        >
          Record Usage
        </Button>
      </Box>
    </Paper>
  );
};

export default BloodUsage;