import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { apiLimiter, emailGenerationLimiter, spamFilter } from '../middleware/email.middleware';

const router = Router();
const emailController = new EmailController();

// Generate new email address (with stricter rate limit)
router.post('/generate', emailGenerationLimiter, emailController.generateEmail);

// Get all emails for an address
router.get('/:emailAddress', apiLimiter, emailController.getEmails);

// Get single email by ID
router.get('/message/:id', apiLimiter, emailController.getEmail);

// Mark email as read
router.patch('/message/:id/read', apiLimiter, emailController.markAsRead);

// Delete email
router.delete('/message/:id', apiLimiter, emailController.deleteEmail);

// Search emails
router.get('/:emailAddress/search', apiLimiter, emailController.searchEmails);

// Forward email
router.post('/message/:id/forward', apiLimiter, emailController.forwardEmail);

// Cleanup email subscription
router.post('/:emailAddress/cleanup', apiLimiter, emailController.cleanupEmail);

// Handle incoming email from SMTP server
router.post('/incoming', spamFilter, emailController.handleIncomingEmail);

export default router; 