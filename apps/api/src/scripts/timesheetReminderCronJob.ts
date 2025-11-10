import { CronJobService } from '../services/cronJob.service';

async function timesheetReminder() {
  const cronService = new CronJobService();

  const runJob = cronService['checkMissingTimesheets'].bind(cronService);
  
  try {
    await runJob();
    console.log('Cron job completed successfully!');
  } catch (error) {
    console.error('Cron job failed:', error);
  }
}

timesheetReminder();
