import { emailQueue } from '../config/queues';
import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailJobData {
  type: string;
  orderId?: string;
  userId?: string;
  orderNumber?: string;
  email?: string;
  subject?: string;
  htmlContent?: string;
  [key: string]: any;
}

export async function initEmailProcessor() {
  // Process 10 emails concurrently
  emailQueue.process(10, async (job) => {
    const jobData = job.data as EmailJobData;
    console.log(`📧 Processing email ${job.id} (${jobData.type})...`);

    try {
      let toEmail = jobData.email || '';
      let subject = jobData.subject || '';
      let htmlContent = jobData.htmlContent || '';

      if (jobData.type === 'order_confirmation') {
        // Get user email from database
        const { data: user, error: userError } = await import('../config/supabase').then(
          (m) => m.supabase
            .from('profiles')
            .select('email')
            .eq('id', jobData.userId)
            .single()
        );

        if (userError || !user) {
          throw new Error(`Could not find user email for order ${jobData.orderId}`);
        }

        toEmail = user.email;
        subject = `Order Confirmation - #${jobData.orderNumber}`;
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Order Confirmed!</h1>
                </div>
                <div class="content">
                  <p>Thank you for your order!</p>
                  <p><strong>Order Number:</strong> ${jobData.orderNumber}</p>
                  <p><strong>Order ID:</strong> ${jobData.orderId}</p>
                  <p>We'll send you tracking information as soon as your order ships.</p>
                  <p>If you have any questions, please contact our support team.</p>
                </div>
                <div class="footer">
                  <p>&copy; 2026 CARMELLA. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;
      } else if (jobData.type === 'low_stock_alert') {
        subject = 'Low Stock Alert - Inventory Action Required';
        htmlContent = jobData.htmlContent;
      } else if (jobData.type === 'b2b_confirmation') {
        subject = 'B2B Request Submitted';
        htmlContent = jobData.htmlContent;
      }

      if (!toEmail) {
        throw new Error('No recipient email address provided');
      }

      // Send email
      const result = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: toEmail,
        subject,
        html: htmlContent,
      });

      console.log(`✅ Email sent to ${toEmail} (Message ID: ${result.messageId})`);
      return { sent: true, messageId: result.messageId, Email: toEmail };

    } catch (error: any) {
      console.error(`❌ Email sending failed for job ${job.id}:`, error.message);
      throw error;
    }
  });

  console.log('📧 Email processor initialized');
}
