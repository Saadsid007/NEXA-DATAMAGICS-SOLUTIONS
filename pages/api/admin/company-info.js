import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { connectDB } from '@/lib/mongodb';
import CompanyInfo from '@/models/CompanyInfo';
import User from '@/models/User';
import { uploadImage } from '@/lib/cloudinary';
import multer from 'multer';

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ storage: multer.memoryStorage() });

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      // Find or create the singleton document
      let info = await CompanyInfo.findOne({ singleton: 'main' }).lean();
      if (!info) {
        // .create() returns a mongoose document, .lean() is not needed here, but we convert to plain object
        info = (await CompanyInfo.create({ singleton: 'main' })).toObject();
      }

      // Fetch the count of approved users
      const totalApprovedUsers = await User.countDocuments({ status: 'approved' });

      return res.status(200).json({ ...info, totalApprovedUsers });

    } catch (error) {
      console.error('Error fetching company info:', error);
      return res.status(500).json({ message: 'Failed to fetch company info.', error: error.message });
    }
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    try {
      await runMiddleware(req, res, upload.single('ceoImage'));

      const { ceoName, ceoTitle, ceoDescriptionP1, ceoDescriptionP2 } = req.body;
      const updateData = {
        ceoName,
        ceoTitle,
        ceoDescriptionP1,
        ceoDescriptionP2,
      };

      if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        const imageUrl = await uploadImage(dataURI);
        updateData.ceoImageUrl = imageUrl;
      }

      const updatedInfo = await CompanyInfo.findOneAndUpdate(
        { singleton: 'main' },
        { $set: updateData },
        { new: true, upsert: true } // upsert will create if it doesn't exist
      );

      return res.status(200).json({ message: 'Company info updated successfully!', data: updatedInfo });
    } catch (error) {
      console.error('Error updating company info:', error);
      return res.status(500).json({ message: 'Failed to update company info.', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
