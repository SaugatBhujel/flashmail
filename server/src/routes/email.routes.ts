import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';

const router = Router();
const emailController = new EmailController();

// Generate new email address
router.post('/generate', emailController.generateEmail);

// Get all emails for an address
router.get('/:emailAddress', emailController.getEmails);

// Get single email by ID
router.get('/message/:id', emailController.getEmail);

// Mark email as read
router.patch('/message/:id/read', emailController.markAsRead);

// Delete email
router.delete('/message/:id', emailController.deleteEmail);

// Search emails
router.get('/:emailAddress/search', emailController.searchEmails);

// Forward email
router.post('/message/:id/forward', emailController.forwardEmail);

// Cleanup email subscription
router.post('/:emailAddress/cleanup', emailController.cleanupEmail);

// Handle incoming email from Mailgun webhook
router.post('/incoming', emailController.handleIncomingEmail);

export default router; 