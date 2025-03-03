import { Request, Response } from 'express';
import { EmailService } from '../services/email.service';

export class EmailController {
  private emailService: EmailService;

  constructor() {
    this.emailService = EmailService.getInstance();
  }

  generateEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const emailAddress = await this.emailService.generateEmailAddress();
      res.json({ email: emailAddress });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate email address' });
    }
  };

  getEmails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { emailAddress } = req.params;
      const emails = await this.emailService.getEmails(emailAddress);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  };

  getEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const email = await this.emailService.getEmailById(id);
      
      if (!email) {
        res.status(404).json({ error: 'Email not found' });
        return;
      }

      res.json(email);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch email' });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const email = await this.emailService.markEmailAsRead(id);
      
      if (!email) {
        res.status(404).json({ error: 'Email not found' });
        return;
      }

      res.json(email);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark email as read' });
    }
  };

  deleteEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.emailService.deleteEmail(id);
      
      if (!success) {
        res.status(404).json({ error: 'Email not found' });
        return;
      }

      res.json({ message: 'Email deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete email' });
    }
  };

  searchEmails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { emailAddress } = req.params;
      const { query } = req.query;
      
      if (typeof query !== 'string') {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      const emails = await this.emailService.searchEmails(emailAddress, query);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search emails' });
    }
  };

  forwardEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { forwardTo } = req.body;

      if (!forwardTo) {
        res.status(400).json({ error: 'Forward to email address is required' });
        return;
      }

      const success = await this.emailService.forwardEmail(id, forwardTo);
      
      if (!success) {
        res.status(404).json({ error: 'Failed to forward email' });
        return;
      }

      res.json({ message: 'Email forwarded successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to forward email' });
    }
  };

  handleIncomingEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const email = await this.emailService.handleIncomingEmail(req.body);
      res.json(email);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process incoming email' });
    }
  };

  cleanupEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { emailAddress } = req.params;
      await this.emailService.cleanupEmail(emailAddress);
      res.json({ message: 'Email cleanup successful' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cleanup email' });
    }
  };
} 