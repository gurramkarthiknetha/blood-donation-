import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { BarChart, LineChart } from '@mui/x-charts';

interface InventoryStatsProps {
  inventoryHistory: {
    date: string;
    bloodType: string;
    quantity: number;
  }[];
  usageStats: {
    bloodType: string;
    used: number;
    received: number;
  }[];
}

const InventoryStats: React.FC<InventoryStatsProps> = ({
  inventoryHistory,
  usageStats
}) => {
  const formatInventoryData = () => {
    const bloodTypes = [...new Set(inventoryHistory.map(item => item.bloodType))];
    const dates = [...new Set(inventoryHistory.map(item => item.date))];
    
    return {
      bloodTypes,
      dates,
      series: bloodTypes.map(type => ({
        data: dates.map(date => {
          const record = inventoryHistory.find(
            item => item.bloodType === type && item.date === date
          );
          return record ? record.quantity : 0;
        }),
        label: type
      }))
    };
  };

  const { dates, series } = formatInventoryData();

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Inventory Trends
        </Typography>
        <LineChart
          xAxis={[{ 
            data: dates,
            scaleType: 'band',
            label: 'Date'
          }]}
          series={series}
          height={300}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Blood Usage Statistics
        </Typography>
        <BarChart
          xAxis={[{
            scaleType: 'band',
            data: usageStats.map(stat => stat.bloodType)
          }]}
          series={[
            {
              data: usageStats.map(stat => stat.used),
              label: 'Used',
              color: '#e57373'
            },
            {
              data: usageStats.map(stat => stat.received),
              label: 'Received',
              color: '#81c784'
            }
          ]}
          height={300}
        />
      </Paper>
    </Box>
  );
};

export default InventoryStats;