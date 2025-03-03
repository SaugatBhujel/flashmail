import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { EmailService } from './email.service';

export class MailgunService {
  private static instance: MailgunService;
  private mailgun: any;
  private domain: string;
  private emailService: EmailService;

  private constructor() {
    const mailgun = new Mailgun(formData);
    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY || ''
    });
    this.domain = process.env.MAILGUN_DOMAIN || '';
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): MailgunService {
    if (!MailgunService.instance) {
      MailgunService.instance = new MailgunService();
    }
    return MailgunService.instance;
  }

  async setupWebhook(): Promise<void> {
    try {
      // Setup webhook for receiving emails
      await this.mailgun.domains.webhooks.create(
        this.domain,
        'store',
        {
          url: `${process.env.SERVER_URL}/api/email/incoming`
        }
      );
      console.log('Mailgun webhook setup successful');
    } catch (error) {
      console.error('Failed to setup Mailgun webhook:', error);
      throw error;
    }
  }

  async verifyWebhookSignature(timestamp: string, token: string, signature: string): boolean {
    try {
      const encodedToken = encodeURIComponent(token);
      const encodedTimestamp = encodeURIComponent(timestamp);
      const encodedSignature = encodeURIComponent(signature);

      return await this.mailgun.webhooks.verify({
        signature: encodedSignature,
        timestamp: encodedTimestamp,
        token: encodedToken
      });
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}