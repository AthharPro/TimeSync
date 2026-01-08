import cron from 'node-cron';
import { UserModel } from '../models/user.model';
import { Timesheet } from '../models/timesheet.model';
import { createNotification } from '../services/notification.service';
import { sendEmail } from '../utils/email/sendEmail';
import { getTimesheetReminderTemplate } from '../utils/email/emailTemplates';
import { APP_ORIGIN } from '../constants/env';
import { NotificationType, UserRole } from '@tms/shared';


const getCurrentWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); 
  
  // Calculate Monday of current week
  const monday = new Date(now);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go to Monday
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  
  // Calculate Sunday of current week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { weekStart: monday, weekEnd: sunday };
};

/**
 * Check all employees and send reminders to those who haven't submitted 40 hours for the current week
 */
const checkAndSendTimesheetReminders = async () => {
  try {
    
    const { weekStart, weekEnd } = getCurrentWeekDates();
    
    // Get all active employees (excluding SupervisorAdmin)
    const employees = await UserModel.find({
      status: true,
      role: { $ne: UserRole.SupervisorAdmin }
    }).select('_id firstName lastName email');
    
    let remindersSent = 0;
    
    for (const employee of employees) {
      try {
        // Get all submitted/approved timesheets for the current week
        const timesheets = await Timesheet.find({
          userId: employee._id,
          date: { $gte: weekStart, $lte: weekEnd },
          status: { $in: ['Pending', 'Approved'] } // Only count submitted or approved timesheets
        }).select('hours');
        
        // Calculate total hours submitted
        const totalHours = timesheets.reduce((sum, ts) => sum + (ts.hours || 0), 0);
        
        // If less than 40 hours, send reminder
        if (totalHours < 40) {
          
          // Send email reminder
          const emailTemplate = getTimesheetReminderTemplate(
            employee.firstName,
            weekStart,
            weekEnd,
            APP_ORIGIN
          );
          
          await sendEmail({
            to: employee.email,
            subject: emailTemplate.subject,
            text: emailTemplate.text,
            html: emailTemplate.html,
          });
          
          // Create in-app notification
          await createNotification({
            userId: employee._id.toString(),
            type: NotificationType.TimesheetReminder,
            title: 'Timesheet Submission Reminder',
            message: `You have only submitted ${totalHours} hours for the current week. Please submit your complete timesheet (40 hours) as soon as possible.`,
          });
          
          remindersSent++;
        } else {
        }
      } catch (error) {
        // Continue with next employee even if one fails
      }
    }
    
  } catch (error) {
  }
};

export const initTimesheetReminderJob = () => {
  // Run every Tuesday at 11:12 AM
  const task = cron.schedule('0 17 * * 5', async () => {
    await checkAndSendTimesheetReminders();
  }, {
    timezone: 'Asia/Colombo' // Adjust timezone as needed
  });
  
  return task;
};

// Export the check function for manual testing if needed
export { checkAndSendTimesheetReminders };
