import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required.'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

export default Announcement;