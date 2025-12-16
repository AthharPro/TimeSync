import nodemailer from 'nodemailer';
import { GMAIL_APP_PASSWORD, GMAIL_USER } from '../constants/env';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER, 
      pass: GMAIL_APP_PASSWORD, 
    },
  });

export default transporter;