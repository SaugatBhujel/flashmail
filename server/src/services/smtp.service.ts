import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { EmailService } from './email.service';
import { Server as SocketServer } from 'socket.io';

export class SMTPService {
  private static instance: SMTPService;
  private server: SMTPServer;
  private io: SocketServer | null = null;
  private emailService: EmailService;

  private constructor() {
    this.emailService = EmailService.getInstance();
    this.server = new SMTPServer({
      secure: false,
      authOptional: true,
      disabledCommands: ['STARTTLS'],
      onData: this.handleEmailData.bind(this),
      onMailFrom: (address, session, callback) => {
        console.log('Mail from:', address.address);
        callback();
      },
      onRcptTo: (address, session, callback) => {
        console.log('Recipient:', address.address);
        // Check if the recipient is one of our temporary emails
        if (!address.address.endsWith('@demo.flashmail.com')) {
          return callback(new Error('Invalid recipient'));
        }
        callback();
      },
    });
  }

  public static getInstance(): SMTPService {
    if (!SMTPService.instance) {
      SMTPService.instance = new SMTPService();
    }
    return SMTPService.instance;
  }

  setSocketServer(io: SocketServer) {
    this.io = io;
  }

  private async handleEmailData(stream: any, session: any, callback: (err?: Error) => void) {
    try {
      const parsed = await simpleParser(stream);
      
      // Process the email
      const emailData = {
        recipient: session.envelope.rcptTo[0].address,
        sender: session.envelope.mailFrom.address,
        subject: parsed.subject || 'No Subject',
        'body-plain': parsed.text || '',
        'body-html': parsed.html || parsed.textAsHtml || '',
      };

      // Save the email and notify clients
      const savedEmail = await this.emailService.handleIncomingEmail(emailData);
      
      if (this.io) {
        this.io.to(emailData.recipient).emit('new-email', savedEmail);
      }

      callback();
    } catch (error) {
      console.error('Error processing email:', error);
      callback(new Error('Error processing email'));
    }
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 2525;
      
      this.server.listen(SMTP_PORT, () => {
        console.log(`SMTP Server running on port ${SMTP_PORT}`);
        resolve();
      });

      this.server.on('error', (err) => {
        console.error('SMTP Server error:', err);
        reject(err);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('SMTP Server stopped');
        resolve();
      });
    });
  }
} 