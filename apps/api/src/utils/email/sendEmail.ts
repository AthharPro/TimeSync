import transporter from '../../config/transporter';
import { GMAIL_USER } from '../../constants/env';

type EmailAttachment = {
  filename: string;
  path: string;
  cid: string;
};

type EmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
};

export const sendEmail = async ({ to, subject, text, html, attachments }: EmailParams) => {
  const mailOptions = {
    from: GMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
