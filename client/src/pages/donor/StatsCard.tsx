import React from 'react';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => {
  return (
    <div className="stats-card">
      <div className="icon">{icon}</div>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
};

export default StatsCard;
