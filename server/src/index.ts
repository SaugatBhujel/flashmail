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
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'healthy',
    database: dbStatus,
    environment: process.env.NODE_ENV
  });
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

// MongoDB connection with enhanced error handling
const connectDB = async (retries = 5, delay = 5000) => {
  try {
    const mongoURI = process.env.MONGODB_URI;
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
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,  // 45 seconds
    });

    console.log('Successfully connected to MongoDB Atlas');
    
    // Set up error handlers for the connection
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
    if (retries > 0) {
      console.log(`Retrying connection in ${delay/1000} seconds... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectDB(retries - 1, delay);
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