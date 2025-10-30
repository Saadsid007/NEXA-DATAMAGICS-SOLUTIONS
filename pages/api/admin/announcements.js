import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectDB } from '@/lib/mongodb';
import Announcement from '@/models/Announcement';

export default async function handler(req, res) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const announcements = await Announcement.find({}).sort({ createdAt: -1 });
        return res.status(200).json(announcements);
      } catch (error) {
        console.error('Error fetching all announcements:', error);
        return res.status(500).json({ message: 'Failed to fetch announcements.', error: error.message });
      }

    case 'POST':
      try {
        const { title, content, isActive } = req.body;
        if (!title || !content) {
          return res.status(400).json({ message: 'Title and content are required.' });
        }
        const newAnnouncement = await Announcement.create({ title, content, isActive });
        return res.status(201).json({ message: 'Announcement created successfully!', data: newAnnouncement });
      } catch (error) {
        console.error('Error creating announcement:', error);
        return res.status(500).json({ message: 'Failed to create announcement.', error: error.message });
      }

    case 'PUT':
      try {
        const { _id, title, content, isActive } = req.body;
        if (!_id || !title || !content) {
          return res.status(400).json({ message: 'Announcement ID, title, and content are required.' });
        }
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
          _id,
          { title, content, isActive },
          { new: true, runValidators: true }
        );
        if (!updatedAnnouncement) {
          return res.status(404).json({ message: 'Announcement not found.' });
        }
        return res.status(200).json({ message: 'Announcement updated successfully!', data: updatedAnnouncement });
      } catch (error) {
        console.error('Error updating announcement:', error);
        return res.status(500).json({ message: 'Failed to update announcement.', error: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query; // Use req.query for DELETE with ID in URL
        if (!id) {
          return res.status(400).json({ message: 'Announcement ID is required.' });
        }
        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
          return res.status(404).json({ message: 'Announcement not found.' });
        }
        return res.status(200).json({ message: 'Announcement deleted successfully!' });
      } catch (error) {
        console.error('Error deleting announcement:', error);
        return res.status(500).json({ message: 'Failed to delete announcement.', error: error.message });
      }

    default:
      return res.status(405).json({ message: 'Method Not Allowed' });
  }
}