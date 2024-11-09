export const medicareCodeTemplate = (
  name: string,
  medicare_code: string,
): string => `
  <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    <h2>Welcome to Our Platform, ${name}!</h2>
    <p>We are excited to have you onboard. Below is your Medicare Code:</p>
    <p><strong>Hospital Code: ${medicare_code}</strong></p>
    <p>Please keep this code safe for your records.</p>
    <p>Thank you for joining us!</p>
    <p>Best regards,<br/>CCDP Team</p>
  </div>
`;
