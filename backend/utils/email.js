const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'mail.theboxlab.co.za',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendVerificationEmail = async (email, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Verify your email',
    text: `Your OTP is ${otp}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw new Error('Failed to send verification email');
  }
};

module.exports = { sendVerificationEmail };