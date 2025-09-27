import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
  // User who applied for the leave
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  employeeCode: {
    type: String,
    required: true,
  },
  // The manager to whom the application is sent
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Manager is also a user with 'admin' role
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['Planned Leave', 'Unplanned Leave', 'Sick Leave'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending', // Default status will be 'Pending'
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

export default mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);