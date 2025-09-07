const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.EMAIL_API_KEY);

const sendMail = async (to,subject,message) => {
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

module.exports = sendMail;