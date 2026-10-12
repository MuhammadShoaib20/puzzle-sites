interface LoginNotificationData {
  email: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
}

export async function sendLoginNotification(data: LoginNotificationData): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not set. Email notification skipped.');
    return;
  }

  try {
    // Parse user agent to get browser and device info
    const browser = parseBrowser(data.userAgent);
    const device = parseDevice(data.userAgent);

    const formattedTime = data.timestamp.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Admin Panel <noreply@puzzlewalkthroughs.com>',
        to: ['msofficial.cs@gmail.com'],
        subject: 'New login to admin panel',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0EA5E9; margin-bottom: 20px;">🔐 New Admin Login</h2>
            
            <p style="color: #333; line-height: 1.6;">
              A new login was detected on your admin panel:
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${data.email}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Time:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${formattedTime} UTC</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">IP Address:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${data.ip}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #666;">Browser:</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #333;">${browser}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #666;">Device:</td>
                <td style="padding: 10px; color: #333;">${device}</td>
              </tr>
            </table>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If this was you, you can safely ignore this email.<br>
              If you didn't initiate this login, please change your password immediately.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
              <p>This is an automated email from Puzzle Walkthroughs Admin Panel.</p>
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email notification:', error);
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

function parseBrowser(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Microsoft Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown Browser';
}

function parseDevice(userAgent: string): string {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('Mac') && !userAgent.includes('iPhone') && !userAgent.includes('iPad')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown Device';
}
