import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/db';
import { APP_ORIGIN, NODE_ENV, PORT } from './constants';
import cors from 'cors';
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import {userRoutes,authRoutes,timesheetRoutes,projectRoutes,taskRoutes,teamRoutes,reportRoutes,reviewRoutes,dashboardRoutes,editRequestRoutes} from "./routes";
import notificationRoutes from "./routes/notification.route";
import historyRoutes from "./routes/history.route";
import { ensureInternalProject } from './utils/data/systemDataUtils';

const port = Number(PORT);

const app = express();
const server = http.createServer(app);

// Setup Socket.io with CORS
export const io = new SocketIOServer(server, {
  cors: {
    origin: NODE_ENV === 'development' ? [APP_ORIGIN, 'http://localhost:4200'] : APP_ORIGIN,
    credentials: true,
  },
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join user's personal notification room
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: NODE_ENV === 'development' ? [APP_ORIGIN, 'http://localhost:4200'] : APP_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/project",projectRoutes)
app.use("/api/timesheet", timesheetRoutes)
app.use("/api/task",taskRoutes)
app.use('/api/team', teamRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/edit-request', editRequestRoutes);


app.use(errorHandler);

server.listen(port, async () => {
  try {
    await connectDB();

    await ensureInternalProject();
    
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);
  } catch (error) {
    console.error('Error during server startup:', error);
  }
});
