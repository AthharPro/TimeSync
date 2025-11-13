import * as cron from 'node-cron';

export class CronJobService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  startScheduledJobs() {
    console.log('Starting scheduled cron jobs...');
    
    // TODO: Add your cron jobs here
    // Example:
    // const timesheetReminder = cron.schedule('0 9 * * 1', () => {
    //   console.log('Running timesheet reminder...');
    // });
    // this.jobs.set('timesheetReminder', timesheetReminder);
  }

  stopAllJobs() {
    this.jobs.forEach((job) => {
      job.stop();
    });
    console.log('All cron jobs stopped');
  }

  stopJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      console.log(`Cron job ${jobName} stopped`);
    }
  }
}
