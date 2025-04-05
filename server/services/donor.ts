function assignBadge(donor) {
	const n = donor.numberOfDonations;
	const badges = [];
  
	if (n >= 1) badges.push("First-Time Donor");
	if (n >= 3) badges.push("Bronze Donor");
	if (n >= 5) badges.push("Silver Donor");
	if (n >= 10) badges.push("Gold Donor");
	if (n >= 20) badges.push("Blood Hero");
  
	donor.badges = [...new Set(badges)]; 
  }
  