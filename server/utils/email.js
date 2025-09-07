import sgMail from '@sendgrid/mail';
import 'dotenv/config';

sgMail.setApiKey(process.env.EMAIL_API_KEY);

export const sendMail = async (to,subject,message) => {
  try {
    const msg = {
      to: to,
      from: process.env.FROM_EMAIL,
      subject: subject,
      text: message,
      html: `<strong>${message}</strong>`,
    }

    const email_response = await sgMail.send(msg);
    return email_response;
  } catch (error) {
    console.error("Error while sending email : ",error.message);
    throw error;
  }
}