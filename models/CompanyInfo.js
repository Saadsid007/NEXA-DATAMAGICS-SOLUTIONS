import mongoose from 'mongoose';

const CompanyInfoSchema = new mongoose.Schema({
  // This field ensures we only ever have one document in this collection
  singleton: {
    type: String,
    default: 'main',
    unique: true,
    required: true,
  },
  ceoName: {
    type: String,
    default: 'Nadeem Khan',
  },
  ceoTitle: {
    type: String,
    default: 'Founder & CEO',
  },
  ceoImageUrl: {
    type: String,
    default: '/ceo-placeholder.png', // Default placeholder
  },
  ceoDescriptionP1: {
    type: String,
    default: `Nadeem Khan is the visionary Founder and Chief Executive Officer of NEXA Datamagics Solutions, an emerging force in the IT and operations sector. As the driving force behind the company's strategic direction, Nadeem has cemented a foundation built on data-driven innovation and cutting-edge technology solutions, specializing in automation, data analytics, and business intelligence.`,
  },
  ceoDescriptionP2: {
    type: String,
    default: `With an entrepreneurial journey marked by a relentless focus on efficiency and growth, Nadeem Khan’s leadership has been key to developing customized, strategic solutions for businesses across banking, wholesale, and retail. His success in steering the company is reflected in his impressive personal net worth, cited at $19.8 million, a testament to his expertise and the market value he has created for NEXA Datamagics Solutions and its clientele.`,
  },
});

const CompanyInfo = mongoose.models.CompanyInfo || mongoose.model('CompanyInfo', CompanyInfoSchema);

export default CompanyInfo;
