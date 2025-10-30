import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectDB } from '@/lib/mongodb';
import Holiday from '@/models/Holiday';

export default async function handler(req, res) {
  await connectDB();

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const holidays = await Holiday.find({}).sort({ date: 'asc' });
        return res.status(200).json(holidays);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch holidays.', error: error.message });
      }

    case 'POST':
      try {
        const { name, date } = req.body;
        if (!name || !date) {
          return res.status(400).json({ message: 'Name and date are required.' });
        }
        const newHoliday = await Holiday.create({ name, date });
        return res.status(201).json({ message: 'Holiday created successfully!', data: newHoliday });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({ message: 'A holiday with this date already exists.' });
        }
        return res.status(500).json({ message: 'Failed to create holiday.', error: error.message });
      }

    case 'PUT':
      try {
        const { _id, name, date } = req.body;
        if (!_id || !name || !date) {
          return res.status(400).json({ message: 'Holiday ID, name, and date are required.' });
        }
        const updatedHoliday = await Holiday.findByIdAndUpdate(_id, { name, date }, { new: true });
        if (!updatedHoliday) return res.status(404).json({ message: 'Holiday not found.' });
        return res.status(200).json({ message: 'Holiday updated successfully!', data: updatedHoliday });
      } catch (error) {
        return res.status(500).json({ message: 'Failed to update holiday.', error: error.message });
      }

    case 'DELETE':
      try {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ message: 'Holiday ID is required.' });
        }
        const deletedHoliday = await Holiday.findByIdAndDelete(id);
        if (!deletedHoliday) return res.status(404).json({ message: 'Holiday not found.' });
        return res.status(200).json({ message: 'Holiday deleted successfully!' });
      } catch (error) {
        return res.status(500).json({ message: 'Failed to delete holiday.', error: error.message });
      }

    default:
      return res.status(405).json({ message: 'Method Not Allowed' });
  }
}