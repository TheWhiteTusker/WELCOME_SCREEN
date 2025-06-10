import nodemailer from 'nodemailer';

// Log SMTP configuration (without sensitive data)
console.log('SMTP Configuration:', {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  from: process.env.SMTP_FROM
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // Allow self-signed certificates
    rejectUnauthorized: false
  }
});

export async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    console.log('Attempting to send email to:', email);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Detailed email error:', {
        message: err.message,
        stack: err.stack,
      });
    } else if (typeof err === 'object' && err !== null) {
      const maybeError = err as Partial<{
        message: string;
        code: string;
        command: string;
        stack: string;
      }>;

      console.error('Detailed email error (non-standard):', {
        message: maybeError.message,
        code: maybeError.code,
        command: maybeError.command,
        stack: maybeError.stack,
      });
    } else {
      console.error('Unknown error type:', err);
    }
    return false;
  }
} 