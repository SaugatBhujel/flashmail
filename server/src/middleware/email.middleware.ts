import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

// Rate limiter for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Rate limiter for email generation
export const emailGenerationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 email generations per hour
  message: 'Too many email addresses generated. Please try again later.'
});

// SMTP rate limiting
export class SMTPRateLimiter {
  private static ipRequests: Map<string, number> = new Map();
  private static lastCleanup: number = Date.now();
  private static readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  static checkLimit(ip: string): boolean {
    this.cleanup();
    
    const currentRequests = this.ipRequests.get(ip) || 0;
    if (currentRequests >= 50) { // 50 emails per hour per IP
      return false;
    }

    this.ipRequests.set(ip, currentRequests + 1);
    return true;
  }

  private static cleanup() {
    const now = Date.now();
    if (now - this.lastCleanup >= this.CLEANUP_INTERVAL) {
      this.ipRequests.clear();
      this.lastCleanup = now;
    }
  }
}

// Basic spam filter
export const spamFilter = (req: Request, res: Response, next: NextFunction) => {
  const spamKeywords = [
    'viagra',
    'casino',
    'lottery',
    'winner',
    'inheritance',
    'prince',
    'bank transfer',
    'investment opportunity'
  ];

  const emailContent = req.body['body-plain']?.toLowerCase() || '';
  const subject = req.body.subject?.toLowerCase() || '';
  
  const isSpam = spamKeywords.some(keyword => 
    emailContent.includes(keyword) || subject.includes(keyword)
  );

  if (isSpam) {
    return res.status(403).json({ error: 'Potential spam detected' });
  }

  next();
}; 