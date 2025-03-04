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

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'healthy',
    database: dbStatus,
    environment: process.env.NODE_ENV,
    mongoUri: process.env.MONGODB_URI ? 'configured' : 'missing'
  });
});

// Routes
app.use('/api/email', emailRoutes);

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

// MongoDB connection with enhanced error handling
const connectDB = async (retries = 5, delay = 5000) => {
  const mongoURI = process.env.MONGODB_URI;
  
  try {
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('Attempting to connect to MongoDB...');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    
    await mongoose.connect(mongoURI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });

    console.log('Successfully connected to MongoDB Atlas');
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('MongoDB URI format:', mongoURI ? 'URI is set' : 'URI is missing');
    
    if (retries > 0) {
      console.log(`Retrying connection in ${delay/1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay);
    }
    
    // Don't exit the process, just log the error
    console.error('Failed to connect to MongoDB after all retries');
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
  }
});