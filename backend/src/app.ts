import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import taskRoutes from './routes/taskRoutes';
import { notFound, errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Task Management API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/tasks', taskRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
