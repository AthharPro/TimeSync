import express from 'express';
import http from 'http';
import connectDB from './config/db';
import { APP_ORIGIN, NODE_ENV, PORT } from './constants/env';
import cors from 'cors';
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler";
import authRoutes from "./routes/auth.route";
import userRoutes from './routes/user.route';
import projectRoutes from './routes/project.route';
import timesheetRoutes from './routes/timesheet.route';
import notificationRoutes from './routes/notification.route';
import teamRoutes from './routes/team.route';
import reportRoutes from './routes/report.route';
import dashboardRoutes from './routes/dashboard.route';
import historyRoutes from './routes/history.route';
import { socketService } from './config/socket';
import { CronJobService } from './services/cronJob.service';

const port = Number(PORT);

const app = express();
const server = http.createServer(app);

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
app.use("/api/timesheets", timesheetRoutes)
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);


app.use(errorHandler);

server.listen(port, async () => {
  try {
    await connectDB();
    socketService.init(server);
    
    // Initialize and start cron jobs
    const cronJobService = new CronJobService();
    cronJobService.startScheduledJobs();
    
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} environment`);
  } catch (error) {
    console.error('Error during server startup:', error);
    // Don't exit the process, just log the error
  }
});
