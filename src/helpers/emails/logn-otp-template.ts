export const otpLoginTemplate = (name: string, otp: number): string => `
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    <h2>Hi ${name},</h2>
    <p>Welcome back! To complete your login, please enter the OTP code below:</p>
    <p><strong>OTP Code: ${otp}</strong></p>
    <p>This code is valid for a short time, so please use it promptly to log in.</p>
    <p>If you did not request this login, please ignore this message or contact our support team immediately.</p>
    <p>Thank you for choosing us!</p>
    <p>Best regards,<br/>CCDP Team</p>
  </div>
`;
