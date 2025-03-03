import mongoose, { Schema, Document } from 'mongoose';

export interface IEmail extends Document {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  receivedAt: Date;
  expiresAt: Date;
  isRead: boolean;
}

const emailSchema = new Schema<IEmail>({
  to: {
    type: String,
    required: true,
    index: true
  },
  from: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  html: {
    type: String,
    required: true
  },
  receivedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

// Create index for automatic deletion after expiration
emailSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IEmail>('Email', emailSchema); 