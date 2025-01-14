// export const otpLoginTemplate = (name: string, otp: number): string => `
//   <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
//     <h2>Hi ${name},</h2>
//     <p>Welcome back! To complete your login, please enter the OTP code below:</p>
//     <p><strong>OTP Code: ${otp}</strong></p>
//     <p>This code is valid for a short time, so please use it promptly to log in.</p>
//     <p>If you did not request this login, please ignore this message or contact our support team immediately.</p>
//     <p>Thank you for choosing us!</p>
//     <p>Best regards,<br/>CCDP Team</p>
//   </div>
// `;

export const otpLoginTemplate = (name: string, otp: number): string => `
  <html>
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f7f7f7;
        color: #333333;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        padding: 20px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        border: 1px solid #ddd;
      }
      .logo {
        margin-bottom: 20px;
        background-color: #192655;
        padding: 10px;
        border-radius: 10px;
      }
      .logo img {
        width: 200px;
        height: auto;
        display: block;
        margin: 0 auto;
      }
      .header {
        font-size: 24px;
        font-weight: bold;
        color: #192655;
        margin: 20px 0;
      }
      .otp-message {
        font-size: 16px;
        line-height: 1.6;
        color: #555555;
        margin-bottom: 20px;
      }
      .otp-code {
        font-size: 24px;
        font-weight: bold;
        color: #192655;
        margin: 10px 0;
      }
      .footer {
        margin-top: 40px;
        font-size: 14px;
        color: #FFFFFF;
        background-color: #192655;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
      }
      .footer p {
        margin: 5px 0;
        color: #FFFFFF;
      }
      .footer a {
        color: #FFFFFF;
        text-decoration: none;
      }
      .disclaimer {
        margin-top: 20px;
        font-size: 12px;
        color: #666666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
                                <img src="https://myte-social-subscription.s3.ca-central-1.amazonaws.com/asset/myte-logo.png" alt="Myte Cody Logo">
      </div>
      <div class="header">
        Login Verification Code
      </div>
      <div class="otp-message">
        <p>Hi ${name},</p>
        <p>
          Welcome back! To complete your login, please enter the OTP code below:
        </p>
        <p class="otp-code">${otp}</p>
        <p>
          This code is valid for a short time, so please use it promptly to log in.
        </p>
        <p>
          If you did not request this login, please ignore this message or contact our support team immediately.
        </p>
      </div>
      <div class="footer">
        <p>🙏 Thank you for choosing us!</p>
        <p><strong>Jewish General Hospital</strong></p>
        <p>3755 Chem. de la Côte-Sainte-Catherine, Montréal, QC H3T 1E2, Canada</p>
        <p>
          <a href="https://www.jgh.ca/">jgh.ca</a> | 
          <a href="mailto:ahmed.mekallach@mytegroup.com">ahmed.mekallach@mytegroup.com</a>
        </p>
      </div>
      <div class="disclaimer">
        <p style="text-align: center;">⚠️ This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </body>
  </html>
`;
