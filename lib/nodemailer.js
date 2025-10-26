import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_SERVER_USER;
const emailPass = process.env.EMAIL_SERVER_PASSWORD;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export const emailStyles = `
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
        .header { background-color: #4f46e5; color: white; padding: 10px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
        .button { background-color: #4f46e5; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
`;

export const sendMail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"NEXA DATAMAGICS SOLUTIONS" <${emailUser}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Could not send email. Error: ", error);
    // We are choosing not to throw the error to prevent the main operation from failing.
  }
};