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

export const sendNewRegistrationEmailToAdmin = async (newUser, admin) => {
    const subject = `New User Registration Pending Approval: ${newUser.name}`;
    const html = `
        ${emailStyles}
        <div class="container">
            <div class="header"><h2>New User Registration</h2></div>
            <div class="content">
                <p>Hello ${admin.name || 'Admin'},</p>
                <p>A new user has registered and is awaiting your approval:</p>
                <table>
                    <tr><th>Name</th><td>${newUser.name}</td></tr>
                    <tr><th>Email</th><td>${newUser.email}</td></tr>
                    <tr><th>Phone</th><td>${newUser.phone}</td></tr>
                    <tr><th>Registered On</th><td>${new Date(newUser.createdAt).toLocaleDateString()}</td></tr>
                </table>
                <p>Please visit the admin panel to review and approve/reject this registration.</p>
                <p><a href="${process.env.NEXTAUTH_URL}/admin/pending-requests" class="button">Go to Admin Panel</a></p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} NEXA DATAMAGICS SOLUTIONS</p></div>
        </div>
    `;
    await sendMail({ to: admin.email, subject, html });
};

export const sendRegistrationStatusEmailToUser = async (user) => {
    const statusText = user.status.charAt(0).toUpperCase() + user.status.slice(1);
    const subject = `Your Registration Status at NEXA DATAMAGICS SOLUTIONS: ${statusText}`;
    let statusColor = '';
    let message = '';
    let actionLink = '';

    if (user.status === 'approved') {
        statusColor = 'green';
        message = `Congratulations! Your registration has been approved. You can now log in to the system.`;
        actionLink = `<p style="margin-top: 20px;"><a href="${process.env.NEXTAUTH_URL}/login" class="button">Login to your Account</a></p>`;
    } else if (user.status === 'rejected') {
        statusColor = 'red';
        message = `We regret to inform you that your registration has been rejected. If you believe this is an error, please contact support.`;
    } else {
        statusColor = 'orange';
        message = `Your registration status is currently ${statusText}.`;
    }

    const html = `
        ${emailStyles}
        <div class="container">
            <div class="header"><h2>Your Registration Status Update</h2></div>
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>${message}</p>
                <h3>Details:</h3>
                <table>
                    <tr><th>Name</th><td>${user.name}</td></tr>
                    <tr><th>Email</th><td>${user.email}</td></tr>
                    <tr><th>Status</th><td><strong style="color: ${statusColor};">${statusText}</strong></td></tr>
                    ${user.role ? `<tr><th>Assigned Role</th><td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td></tr>` : ''}
                </table>
                ${actionLink}
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} NEXA DATAMAGICS SOLUTIONS</p></div>
        </div>
    `;
    await sendMail({ to: user.email, subject, html });
};

export const sendPasswordResetEmail = async (user, resetUrl) => {
    const subject = `Reset Your Password for NEXA DATAMAGICS SOLUTIONS`;
    const html = `
        ${emailStyles}
        <div class="container">
            <div class="header"><h2>Password Reset Request</h2></div>
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>You requested a password reset. Click the button below to set a new password. This link is valid for 10 minutes.</p>
                <p style="text-align: center; margin: 20px 0;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} NEXA DATAMAGICS SOLUTIONS</p></div>
        </div>
    `;
    await sendMail({ to: user.email, subject, html });
};

export const sendPasswordResetConfirmationEmail = async (user) => {
    const subject = `Your Password Has Been Changed`;
    const html = `
        ${emailStyles}
        <div class="container">
            <div class="header"><h2>Password Changed Successfully</h2></div>
            <div class="content">
                <p>Hello ${user.name},</p>
                <p>This is a confirmation that the password for your account has just been changed.</p>
                <p>If you did not make this change, please contact support immediately.</p>
                <p style="margin-top: 20px;">
                    <a href="${process.env.NEXTAUTH_URL}/login" class="button">Login to Your Account</a>
                </p>
            </div>
            <div class="footer"><p>&copy; ${new Date().getFullYear()} NEXA DATAMAGICS SOLUTIONS</p></div>
        </div>
    `;
    await sendMail({ to: user.email, subject, html });
};