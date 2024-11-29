import nodemailer from 'nodemailer';

// Create a transporter using SMTP with more detailed configuration
export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587, // Use TLS port
  secure: false, // Upgrade later with STARTTLS
  requireTLS: true,
  auth: {
    type: 'login', // Explicitly specify login type
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD
  },
  // Additional connection options
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 20000,
  // Debug option to see detailed logs
  debug: true,
  logger: true
});

// Verification function with more robust error handling
export const verifyTransporter = () => {
  return new Promise((resolve, reject) => {
    transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Verification Failed:', {
          message: error.message,
          code: error.code,
          response: error.response,
          stack: error.stack
        });
        reject(error);
      } else {
        console.log('SMTP Server is ready to send messages');
        resolve(success);
      }
    });
  });
};

// Optional: Test email sending
export const sendTestEmail = async () => {
  try {
    const testInfo = await transporter.sendMail({
      from: `"Test" <${process.env.SMTP_MAIL}>`,
      to: process.env.SMTP_MAIL, // Send to yourself
      subject: 'SMTP Configuration Test',
      text: 'This is a test email to verify SMTP configuration.'
    });
    console.log('Test email sent:', testInfo.messageId);
    return testInfo;
  } catch (error) {
    console.error('Test email sending failed:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};