import { Server as SocketServer } from 'socket.io';
import { EmailService } from './email.service';

export class DemoEmailService {
  private static instance: DemoEmailService;
  private io: SocketServer | null = null;
  private activeEmails: Set<string> = new Set();
  private senderEmails = [
    'news@demo.com',
    'social@demo.com',
    'updates@demo.com',
    'notifications@demo.com'
  ];
  private subjects = [
    'Welcome to Flash Mail!',
    'Your Daily Update',
    'New Feature Announcement',
    'Security Alert',
    'Newsletter Subscription'
  ];
  private messages = [
    'Thank you for using Flash Mail. This is a demo message.',
    'Here is your daily update with the latest news.',
    'We have launched an exciting new feature!',
    'Your account security is our top priority.',
    'Stay updated with our latest newsletter.'
  ];

  private constructor() {}

  public static getInstance(): DemoEmailService {
    if (!DemoEmailService.instance) {
      DemoEmailService.instance = new DemoEmailService();
    }
    return DemoEmailService.instance;
  }

  setSocketServer(io: SocketServer) {
    this.io = io;
  }

  async initialize(): Promise<void> {
    console.log('Demo email service initialized');
    this.startDemoEmailGenerator();
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  addActiveEmail(emailAddress: string) {
    this.activeEmails.add(emailAddress);
    console.log('Added active email:', emailAddress);
    console.log('Current active emails:', Array.from(this.activeEmails));
  }

  removeActiveEmail(emailAddress: string) {
    this.activeEmails.delete(emailAddress);
    console.log('Removed active email:', emailAddress);
    console.log('Current active emails:', Array.from(this.activeEmails));
  }

  private startDemoEmailGenerator() {
    // Generate demo emails every 15-30 seconds
    setInterval(async () => {
      try {
        // Send demo emails to all active email addresses
        for (const recipient of this.activeEmails) {
          const emailService = EmailService.getInstance();
          
          // Generate a demo email with random content
          const demoEmail = {
            recipient,
            sender: this.getRandomItem(this.senderEmails),
            subject: this.getRandomItem(this.subjects),
            'body-plain': this.getRandomItem(this.messages),
            'body-html': `<div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>${this.getRandomItem(this.subjects)}</h2>
              <p>${this.getRandomItem(this.messages)}</p>
              <hr>
              <p style="color: #666;">This is a demo email from Flash Mail</p>
            </div>`
          };

          const savedEmail = await emailService.handleIncomingEmail(demoEmail);
          
          // Emit the new email event through Socket.IO
          if (this.io) {
            this.io.to(recipient).emit('new-email', savedEmail);
          }
        }
      } catch (error) {
        console.error('Error generating demo email:', error);
      }
    }, Math.random() * 15000 + 15000); // Random interval between 15-30 seconds
  }

  async forwardEmail(emailId: string, forwardTo: string): Promise<boolean> {
    try {
      console.log(`Demo: Email ${emailId} would be forwarded to ${forwardTo}`);
      return true;
    } catch (error) {
      console.error('Error in demo forward:', error);
      return false;
    }
  }
} 