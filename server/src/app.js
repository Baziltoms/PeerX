import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import communicationsRoutes from './routes/communicationsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow development client access
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.resolve('uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PeerX MERN Platform API is healthy and operational.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/ai', aiRoutes);

// Fallback 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
