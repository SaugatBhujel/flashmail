import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import emailRoutes from './routes/email.routes';
import { DemoEmailService } from './services/demo.service';
import { SMTPService } from './services/smtp.service';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://flashmail.onrender.com', 'https://www.flashmail.onrender.com']
      : 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type']
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://flashmail.onrender.com', 'https://www.flashmail.onrender.com']
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('../client/build'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Routes
app.use('/api/email', emailRoutes);

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '../client/build' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-email-room', (emailAddress: string) => {
    socket.join(emailAddress);
    console.log(`Socket ${socket.id} joined room: ${emailAddress}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flashmail';
    await mongoose.connect(mongoURI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return connectDB(retries - 1);
    }
    process.exit(1);
  }
};

// Initialize services
const smtpService = SMTPService.getInstance();
smtpService.setSocketServer(io);

// Start servers
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
  console.log(`HTTP Server running on port ${PORT}`);
  await connectDB();
  
  try {
    await smtpService.start();
    console.log('SMTP server started successfully');
  } catch (error) {
    console.error('Failed to start SMTP server:', error);
    process.exit(1);
  }
});