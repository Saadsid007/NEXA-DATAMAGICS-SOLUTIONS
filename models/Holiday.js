import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

const Holiday = mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema);

export default Holiday;