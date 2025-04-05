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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { hospitalService } from '../../services/hospitalService';

interface BloodStock {
  bloodType: string;
  quantity: number;
  lastUpdated: string;
}

const BloodInventory: React.FC = () => {
  const [inventory, setInventory] = useState<BloodStock[]>([]);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedStock, setSelectedStock] = useState<BloodStock | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await hospitalService.getBloodInventory();
      setInventory(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleUpdateClick = (stock: BloodStock) => {
    setSelectedStock(stock);
    setNewQuantity(stock.quantity.toString());
    setUpdateDialog(true);
  };

  const handleUpdateConfirm = async () => {
    if (!selectedStock) return;

    try {
      await hospitalService.updateBloodInventory({
        bloodType: selectedStock.bloodType,
        quantity: parseInt(newQuantity)
      });
      setUpdateDialog(false);
      fetchInventory();
    } catch (error) {
      setError('Error updating inventory');
    }
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity <= 10) return 'error.main';
    if (quantity <= 20) return 'warning.main';
    return 'success.main';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Blood Type</TableCell>
              <TableCell>Quantity (Units)</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventory.map((stock) => (
              <TableRow key={stock.bloodType}>
                <TableCell>{stock.bloodType}</TableCell>
                <TableCell sx={{ color: getQuantityColor(stock.quantity) }}>
                  {stock.quantity}
                </TableCell>
                <TableCell>
                  {new Date(stock.lastUpdated).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleUpdateClick(stock)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)}>
        <DialogTitle>Update Blood Inventory</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="New Quantity"
            type="number"
            fullWidth
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateConfirm} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BloodInventory;