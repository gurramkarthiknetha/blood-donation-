import React from 'react';
import { IoMdCheckboxOutline } from "react-icons/io";


const RewardsBadges: React.FC = () => {
  return (
    <div className="card">
      <h3>Rewards & Badges</h3>
      <div className="badges">
        <span><IoMdCheckboxOutline />Gold Donor</span>
        <span><IoMdCheckboxOutline />Life Saver</span>
        <span><IoMdCheckboxOutline />Regular Donor</span>
      </div>
      <div className="progress-bar">
        <div className="progress" style={{ width: '75%' }}></div>
      </div>
      <button className="download-btn">Download Certificate</button>
    </div>
  );
};

export default RewardsBadges;

