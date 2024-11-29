import { transporter } from '../middleware/nodemailer.js';

// Improved email sending function with comprehensive error handling
const sendVerificationEmail = async (email, username, verificationLink) => {
  const logoUrl = process.env.COMPANY_LOGO_URL || 'https://via.placeholder.com/200x100.png?text=Company+Logo';

  try {
    // Validate input
    if (!email || !username || !verificationLink) {
      throw new Error('Missing required parameters for email verification');
    }

    // Detailed mail options
    const mailOptions = {
      from: {
        name: 'Your Company',
        address: process.env.SMTP_MAIL
      },
      to: email,
      subject: 'Confirm Your Registration',
      html: createRegistrationEmail(username, verificationLink, logoUrl),
      // Additional headers for improved deliverability
      headers: {
        'X-Mailer': 'NodeJS Verification Mailer',
        'X-Priority': '1' // High priority
      }
    };

    // Send mail with comprehensive logging
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Verification email details:', {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      envelope: info.envelope
    });

    return info;
  } catch (error) {
    // Comprehensive error logging
    console.error('Verification Email Sending Error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name,
      // Additional context about the email attempt
      emailDetails: {
        to: email,
        username: username
      }
    });

    // Throw a more informative error
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Helper function to create email HTML (as before)
const createRegistrationEmail = (username, verificationLink, logoUrl) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .container {
        background-color: #f4f4f4;
        border-radius: 10px;
        padding: 30px;
        text-align: center;
      }
      .logo {
        max-width: 200px;
        margin-bottom: 20px;
      }
      .btn {
        display: inline-block;
        background-color: #007bff;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img src="${logoUrl}" alt="Company Logo" class="logo">
      <h1>Welcome, ${username}!</h1>
      <p>Thank you for registering with us. To complete your registration, please click the button below:</p>
      <a href="${verificationLink}" class="btn">Verify Your Email</a>
      <p>If the button doesn't work, copy and paste the following link in your browser:</p>
      <p>${verificationLink}</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  </body>
  </html>
  `;
};

export default sendVerificationEmail;