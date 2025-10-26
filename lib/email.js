import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    secure: process.env.EMAIL_SERVER_PORT === '465', // Use true for port 465, false for all other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

const emailStyles = `
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
    const info = await transporter.sendMail({
      from: `"NEXA DATAMAGICS SOLUTIONS" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Re-throw the error to let the caller handle it.
    throw new Error('Failed to send email.');
  }
};

export const sendLeaveApplicationEmailToManager = async (leave, user, manager) => {
    const subject = `New Leave Application from ${user.name}`;
    const html = `
        ${emailStyles}
        <div class="container">
            <div class="header"><h2>New Leave Application</h2></div>
            <div class="content">
                <p>Hello ${manager.name},</p>
                <p>A new leave application has been submitted by <strong>${user.name}</strong> (${user.employeeCode}) for your approval.</p>
                <h3>Details:</h3>
                <table>
                    <tr><th>Leave Type</th><td>${leave.leaveType}</td></tr>
                    <tr><th>Start Date</th><td>${new Date(leave.startDate).toLocaleDateString()}</td></tr>
                    <tr><th>End Date</th><td>${new Date(leave.endDate).toLocaleDateString()}</td></tr>
                    <tr><th>Reason</th><td>${leave.reason}</td></tr>
                    ${leave.attachmentUrl ? `<tr><th>Attachment</th><td><a href="${leave.attachmentUrl}" target="_blank">View Attachment</a></td></tr>` : ''}
                </table>
                <p>You can manage this request in the portal.</p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} NEXA DATAMAGICS SOLUTIONS</p></div>
        </div>
    `;
    await sendMail({ to: manager.email, subject, html });
};

export const sendLeaveStatusUpdateEmailToUser = async (leave, user) => {
    const statusText = leave.status.charAt(0).toUpperCase() + leave.status.slice(1);
    const subject = `Your Leave Application has been ${statusText}`;
    const html = `
        ${emailStyles}
        <div class="container">
            <div class="header"><h2>Leave Application Update</h2></div>
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>Your leave application has been <strong>${statusText}</strong>.</p>
                <h3>Details:</h3>
                <table>
                    <tr><th>Leave Type</th><td>${leave.leaveType}</td></tr>
                    <tr><th>Start Date</th><td>${new Date(leave.startDate).toLocaleDateString()}</td></tr>
                    <tr><th>End Date</th><td>${new Date(leave.endDate).toLocaleDateString()}</td></tr>
                    <tr><th>Status</th><td><strong style="color: ${leave.status === 'approved' ? 'green' : 'red'};">${statusText}</strong></td></tr>
                </table>
                <p>You can view your leave history in the portal.</p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} NEXA DATAMAGICS SOLUTIONS</p></div>
        </div>
    `;
    await sendMail({ to: user.email, subject, html });
};