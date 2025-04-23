import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendRegistrationEmail = async (recipientEmail: string, token: string): Promise<void> => {
  const registrationLink = `${process.env.CLIENT_URL}/register?token=${token}`;
  console.log(process.env.CLIENT_URL);
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: recipientEmail,
    subject: 'Welcome to the Employee Portal – Registration Link',
    html: `
      <p>Hello,</p>
      <p>You’ve been invited to register your account. Click the link below to begin:</p>
      <a href="${registrationLink}">${registrationLink}</a>
      <p>This link will expire in 3 hours.</p>
      <p>Thank you,<br/>HR Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendFeedbackEmail = async (recipientEmail: string, subject: string, message: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: recipientEmail,
    subject,
    html: `
      <p>${message}</p>
      <p>Please log in to the portal to review and take further action.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
