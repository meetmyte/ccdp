// export const medicareCodeTemplate = (
//   firstName: string,
//   lastName: string,
//   medicare_code: string,
// ): string => `
//   <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
//     <h2>Welcome to Our Platform, ${firstName}!</h2>
//     <p>We are excited to have you onboard. Below is your Medicare Code:</p>
//     <p><strong>Hospital Code: ${medicare_code}</strong></p>
//     <p>Please keep this code safe for your records.</p>
//     <p>Thank you for joining us!</p>
//     <p>Best regards,<br/>CCDP Team</p>
//   </div>
// `;

export const medicareCodeTemplate = (
  firstName: string,
  lastName: string,
  medicareCode: string
): string => `
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
      .welcome-message {
        font-size: 16px;
        line-height: 1.6;
        color: #555555;
        margin-bottom: 20px;
      }
      .cta {
        margin-top: 20px;
      }
      .cta a {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        color: white;
        background-color: #192655;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        margin: 5px;
      }
      .cta .disabled {
        background-color: #999;
        cursor: not-allowed;
        position: relative;
      }
      .cta .disabled:hover::after {
        content: 'Coming Soon';
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.75);
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
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
        Welcome to Our Platform, ${firstName} ${lastName}!
      </div>
      <div class="welcome-message">
        <p>Dear ${firstName},</p>
        <p>
          We are delighted to welcome you to our platform. Below is your hospital code, which you will use 
          to access our services.
        </p>
        <p>
          <strong>Patient Code: ${medicareCode}</strong>
        </p>
        <p>Please keep this code safe and secure for your records.</p>
        <p>Thank you for choosing us. We're here to support you every step of the way!</p>
      </div>
      <div class="cta">
        <a href="https://apps.apple.com/us/app/myte-health/id6741458318" target="_blank">Download iOS App</a>
        <a class="disabled">Download Android App</a>
      </div>
      <div class="footer">
        <p>🙏 Thank you for joining us!</p>
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
