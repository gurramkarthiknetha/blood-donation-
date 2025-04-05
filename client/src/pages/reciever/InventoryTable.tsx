import React from 'react';

interface InventoryItem {
  bloodType: string;
  quantity: number;
  lastUpdated: string;
}

interface InventoryTableProps {
  inventory: InventoryItem[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory }) => {
  return (
    <div className="inventory-table mt-4">
      <h3 className="mb-3">Current Inventory</h3>
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>Blood Type</th>
              <th>Available Units</th>
              <th>Last Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.bloodType}>
                <td>{item.bloodType}</td>
                <td>{item.quantity}</td>
                <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${item.quantity > 10 ? 'bg-success' : 
                    item.quantity > 5 ? 'bg-warning' : 'bg-danger'}`}>
                    {item.quantity > 10 ? 'Sufficient' : 
                     item.quantity > 5 ? 'Low' : 'Critical'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;