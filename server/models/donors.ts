import mongoose from 'mongoose';

const DonorSchema = new mongoose.Schema({
	fullName: { type: String, required: true },
	gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
	age: { type: Number, required: true, min: 18, max: 65 },
	dob: { type: Date, required: true },
	bloodGroup: { 
	  type: String, 
	  enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
	  required: true 
	},
	aadhar: { type: String, required: true, unique: true },
  
	email: { type: String, required: true, unique: true },
	phone: { type: String, required: true },
	address: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	zipCode: { type: String, required: true },
  
	lastDonationDate: { type: Date },
	numberOfDonations: { type: Number, default: 0 },
	points: { type: Number, default: 0 },
	badges: { type: [String], default: ['Bronze Donor'] },
  
	password: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	location: {
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point'
		},
		coordinates: {
			type: [Number],
			required: true
		}
	}
});

// Create spatial index for location-based queries
DonorSchema.index({ location: '2dsphere' });

const Donor = mongoose.model('Donor', DonorSchema);
export default Donor;
