import { EmailService } from './email.service';
import { Server as SocketServer } from 'socket.io';

export class NodemailerService {
  private static instance: NodemailerService;
  private io: SocketServer | null = null;

  private constructor() {}

  public static getInstance(): NodemailerService {
    if (!NodemailerService.instance) {
      NodemailerService.instance = new NodemailerService();
    }
    return NodemailerService.instance;
  }

  setSocketServer(io: SocketServer) {
    this.io = io;
  }

  async initialize(): Promise<void> {
    console.log('Demo email service initialized');
    // Start the demo email generator
    this.startDemoEmailGenerator();
  }

  private startDemoEmailGenerator() {
    // Generate demo emails every 30 seconds
    setInterval(async () => {
      try {
        const emailService = EmailService.getInstance();
        const emails = await emailService.getEmails('demo@flashmail.com');
        
        // Generate a demo email
        const demoEmail = {
          recipient: 'demo@flashmail.com',
          sender: 'system@demo.flashmail.com',
          subject: `Demo Email #${Math.floor(Math.random() * 1000)}`,
          'body-plain': 'This is a demo email message.',
          'body-html': '<p>This is a demo email message.</p>'
        };

        const savedEmail = await emailService.handleIncomingEmail(demoEmail);
        
        // Emit the new email event through Socket.IO
        if (this.io) {
          this.io.to(demoEmail.recipient).emit('new-email', savedEmail);
        }
      } catch (error) {
        console.error('Error generating demo email:', error);
      }
    }, 30000); // Every 30 seconds
  }

  async forwardEmail(emailId: string, forwardTo: string): Promise<boolean> {
    try {
      console.log(`Demo: Email ${emailId} forwarded to ${forwardTo}`);
      return true;
    } catch (error) {
      console.error('Error forwarding email:', error);
      return false;
    }
  }
}