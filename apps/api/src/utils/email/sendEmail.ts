import transporter from '../../config/transporter';
import { GMAIL_USER } from '../../constants/env';

type EmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export const sendEmail = async ({ to, subject, text, html }: EmailParams) => {
  const mailOptions = {
    from: GMAIL_USER,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
