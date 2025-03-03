import Email, { IEmail } from '../models/email.model';
import { DemoEmailService } from './demo.service';

export class EmailService {
  private static instance: EmailService;
  private domain: string;
  private demoService: DemoEmailService;

  private constructor() {
    this.domain = 'demo.flashmail.com';
    this.demoService = DemoEmailService.getInstance();
    console.log('Email service initialized with domain:', this.domain);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async generateEmailAddress(): Promise<string> {
    try {
      const randomString = Math.random().toString(36).substring(2, 12);
      const emailAddress = `${randomString}@${this.domain}`;
      console.log('Generated email address:', emailAddress);
      this.demoService.addActiveEmail(emailAddress);
      return emailAddress;
    } catch (error) {
      console.error('Error generating email address:', error);
      throw new Error('Failed to generate email address');
    }
  }

  async getEmails(emailAddress: string): Promise<IEmail[]> {
    try {
      this.demoService.addActiveEmail(emailAddress);
      return await Email.find({ to: emailAddress }).sort({ receivedAt: -1 });
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Failed to fetch emails');
    }
  }

  async getEmailById(id: string): Promise<IEmail | null> {
    try {
      return await Email.findById(id);
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      throw new Error('Failed to fetch email');
    }
  }

  async markEmailAsRead(id: string): Promise<IEmail | null> {
    try {
      return await Email.findByIdAndUpdate(id, { isRead: true }, { new: true });
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw new Error('Failed to mark email as read');
    }
  }

  async deleteEmail(id: string): Promise<boolean> {
    try {
      const result = await Email.deleteOne({ _id: id });
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error deleting email:', error);
      throw new Error('Failed to delete email');
    }
  }

  async searchEmails(emailAddress: string, query: string): Promise<IEmail[]> {
    try {
      return await Email.find({
        to: emailAddress,
        $or: [
          { subject: { $regex: query, $options: 'i' } },
          { text: { $regex: query, $options: 'i' } },
          { from: { $regex: query, $options: 'i' } }
        ]
      }).sort({ receivedAt: -1 });
    } catch (error) {
      console.error('Error searching emails:', error);
      throw new Error('Failed to search emails');
    }
  }

  async handleIncomingEmail(emailData: any): Promise<IEmail> {
    try {
      const expirationHours = parseInt(process.env.EMAIL_EXPIRATION_HOURS || '24');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      const email = new Email({
        to: emailData.recipient,
        from: emailData.sender || 'demo@example.com',
        subject: emailData.subject || 'Demo Email',
        text: emailData['body-plain'] || 'This is a demo email message.',
        html: emailData['body-html'] || '<p>This is a demo email message.</p>',
        expiresAt
      });

      return await email.save();
    } catch (error) {
      console.error('Error handling incoming email:', error);
      throw new Error('Failed to handle incoming email');
    }
  }

  async forwardEmail(emailId: string, forwardTo: string): Promise<boolean> {
    return this.demoService.forwardEmail(emailId, forwardTo);
  }

  async cleanupEmail(emailAddress: string): Promise<void> {
    try {
      // Remove the email from active emails in demo service
      this.demoService.removeActiveEmail(emailAddress);
      console.log('Cleaned up email:', emailAddress);
    } catch (error) {
      console.error('Error cleaning up email:', error);
      throw new Error('Failed to cleanup email');
    }
  }
}