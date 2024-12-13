import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';

import { initializeSocket } from './socket.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { studentRoutes } from './routes/student.routes.js';
import { teacherRoutes } from './routes/teacher.routes.js';
import { parentRoutes } from './routes/parent.routes.js';
import { messageRoutes } from './routes/message.routes.js';
import { attendanceRoutes } from './routes/attendance.routes.js';
import { gradeRoutes } from './routes/grade.routes.js';
import { feeRoutes } from './routes/fee.routes.js';
import { classroomRoutes } from './routes/classroom.routes.js';
import { assignmentRoutes } from './routes/assignment.routes.js';
import { reportRoutes } from './routes/report.routes.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = initializeSocket(server);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/reports', reportRoutes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((err) => logger.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

export default app;