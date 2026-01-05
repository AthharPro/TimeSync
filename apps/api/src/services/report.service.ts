import { DailyTimesheetStatus } from '@tms/shared';
import appAssert from '../utils/validation/appAssert';
import { UNAUTHORIZED } from '../constants/http';
import { Timesheet } from '../models/timesheet.model';
import {UserModel} from '../models/user.model';
import { 
  IReportFilter, 
  ITimesheetReportData,
  ITimesheetReportCategory,
  ITimesheetReportDataItem,
  ReportFormat
} from '../interfaces/report';
import { ExcelReportGenerator } from '../utils/report/excel';
import { PDFReportGenerator } from '../utils/report/pdf';
import { getSupervisedUserIds } from '../utils/data/assignmentUtils';

export class ReportService {
  
  // Generate detailed timesheet report
  // Aggregates day-by-day timesheet entries from the database into weekly reports
  static async generateDetailedTimesheetReport(
    supervisorId: string,
    filter: IReportFilter,
    format: ReportFormat
  ): Promise<Buffer> {
    // Verify supervisor has access
    const supervisedUserIds = await getSupervisedUserIds(supervisorId);
    appAssert(
      supervisedUserIds.length > 0,
      UNAUTHORIZED,
      'You have no supervised employees to generate reports for'
    );

    const query: any = {
      userId: { $in: supervisedUserIds }
    };

    // Filter by date range - query individual daily timesheet entries
    if (filter.startDate || filter.endDate) {
      query.date = {};
      if (filter.startDate) {
        query.date.$gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        const end = new Date(filter.endDate);
        // Set to end of day to include all entries on the last day
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (filter.employeeIds && filter.employeeIds.length > 0) {
      query.userId = { $in: filter.employeeIds.filter(id => supervisedUserIds.includes(id)) };
    }

    if (filter.approvalStatus && filter.approvalStatus.length > 0) {
      query.status = { $in: filter.approvalStatus };
    }

    // Fetch individual daily timesheet entries from the database
    // Each document represents one day's work on a specific project/task
    const timesheets = await Timesheet.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('projectId', 'projectName')
      .populate('taskId', 'taskName')
      .sort({ date: 1 });

    // Check if filtering by individual user or project-wise
    const isIndividualUser = filter.employeeIds && filter.employeeIds.length === 1;
    const isProjectWise = filter.projectIds && filter.projectIds.length > 0;

    // Step 1: Group daily timesheet entries by user
    // Step 2: Within each user, group by week (Sunday to Saturday)
    const userGroupedData = this.groupTimesheetsByUser(timesheets as any[]);

    // Transform to report format
    const reportData: ITimesheetReportData[] = [];

    for (const [userId, userTimesheets] of userGroupedData) {
      const firstEntry = userTimesheets[0];
      const user = firstEntry.userId as any;

      if (isIndividualUser || isProjectWise) {
        // For individual users OR project-wise filtering: Group by project/task first, then show weeks as rows
        // This gives each user their own section with timesheets organized by categories
        // Group all timesheets by project/task
        const projectTaskMap = new Map<string, any[]>();
        
        for (const entry of userTimesheets) {
          const projectId = entry.projectId?._id?.toString() || 'none';
          const taskId = entry.taskId?._id?.toString() || 'none';
          const projectName = entry.projectId?.projectName || 'No Project';
          const taskName = entry.taskId?.taskName || 'No Task';
          const isLeave = !entry.projectId && !entry.taskId;
          
          let key: string;
          let categoryType: string;
          
          if (isLeave) {
            // For leave, group by work type
            key = `leave_${entry.description || 'Other'}`;
            categoryType = 'Leave';
          } else {
            key = `${projectId}_${taskId}`;
            categoryType = 'Work';
          }
          
          if (!projectTaskMap.has(key)) {
            projectTaskMap.set(key, []);
          }
          const array = projectTaskMap.get(key);
          if (array) {
            array.push({
              ...entry,
              _categoryType: categoryType,
              _categoryName: isLeave ? 'Leave' : `${projectName} - ${taskName}`,
              _projectName: projectName,
              _taskName: taskName
            });
          }
        }
        
        // Create categories for each project/task/leave
        const categories: ITimesheetReportCategory[] = [];
        
        for (const [, entries] of projectTaskMap) {
          const firstEntry = entries[0];
          const categoryType = firstEntry._categoryType;
          const categoryName = firstEntry._categoryName;
          
          // Group these entries by week
          const weeklyData = this.groupTimesheetsByWeekForUser(entries);
          const sortedWeeks = Array.from(weeklyData.keys()).sort();
          
          // Create one item per week for this project/task
          const weekItems: ITimesheetReportDataItem[] = [];
          
          for (const weekStartDate of sortedWeeks) {
            const weekEntries = weeklyData.get(weekStartDate);
            if (!weekEntries) continue;
            
            // Get week end date (Friday - last working day)
            const weekStart = new Date(weekStartDate);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 4); // Friday (Mon + 4 days)
            const weekEndStr = weekEnd.toISOString().slice(0, 10);
            
            // Aggregate hours by day for this week
            const dailyHours: number[] = Array(7).fill(0);
            const dailyDescriptions: string[] = Array(7).fill('');
            const dailyStatus: DailyTimesheetStatus[] = Array(7).fill(DailyTimesheetStatus.Draft);
            
            for (const entry of weekEntries) {
              const entryDate = new Date(entry.date);
              const dayOfWeek = entryDate.getDay();
              const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday=0, Sunday=6
              
              dailyHours[dayIndex] += entry.hours || 0;
              
              if (entry.description) {
                if (dailyDescriptions[dayIndex]) {
                  dailyDescriptions[dayIndex] += `; ${entry.description}`;
                } else {
                  dailyDescriptions[dayIndex] = entry.description;
                }
              }
              
              const currentStatus = dailyStatus[dayIndex];
              const newStatus = entry.status || DailyTimesheetStatus.Draft;
              if (this.getStatusPriority(newStatus) > this.getStatusPriority(currentStatus)) {
                dailyStatus[dayIndex] = newStatus;
              }
            }
            
            // Calculate total hours for Mon-Fri only (indices 0-4)
            const totalHours = dailyHours.slice(0, 5).reduce((sum, h) => sum + h, 0);
            
            // Determine week status based on Mon-Fri only
            const weekStatuses = dailyStatus.slice(0, 5).filter((s, idx) => dailyHours[idx] > 0);
            let weekStatus = DailyTimesheetStatus.Draft;
            if (weekStatuses.every(s => s === DailyTimesheetStatus.Approved)) {
              weekStatus = DailyTimesheetStatus.Approved;
            } else if (weekStatuses.some(s => s === DailyTimesheetStatus.Rejected)) {
              weekStatus = DailyTimesheetStatus.Rejected;
            } else if (weekStatuses.some(s => s === DailyTimesheetStatus.Pending)) {
              weekStatus = DailyTimesheetStatus.Pending;
            }
            
            weekItems.push({
              work: categoryType === 'Leave' ? firstEntry.description || 'Leave' : weekStartDate,
              projectName: firstEntry._projectName,
              projectId: firstEntry.projectId?._id?.toString(),
              teamName: undefined,
              teamId: undefined,
              dailyHours,
              dailyDescriptions,
              dailyStatus: dailyStatus.map(() => weekStatus),
              totalHours,
              weekStartDate: weekStartDate,
              weekEndDate: weekEndStr,
              weekStatus: weekStatus
            } as any);
          }
          
          categories.push({
            category: categoryName,
            items: weekItems
          });
        }
        
        // Calculate total hours across all categories
        const totalHours = categories.reduce((sum, cat) => 
          sum + cat.items.reduce((catSum, item) => catSum + item.totalHours, 0), 0
        );
        
        reportData.push({
          employeeId: userId,
          employeeName: `${user.firstName} ${user.lastName}`,
          employeeEmail: user.email,
          weekStartDate: new Date(),
          timesheetId: `${userId}_aggregate`, 
          status: DailyTimesheetStatus.Approved,
          submissionDate: this.getLatestDate(userTimesheets, 'updatedAt'),
          approvalDate: this.getLatestDate(userTimesheets, 'updatedAt'),
          rejectionReason: undefined,
          categories,
          totalHours
        });
        
      } else {
        // For multiple users: Keep existing week-by-week format
        const weeklyData = this.groupTimesheetsByWeekForUser(userTimesheets);
        
        for (const [weekStartDate, entries] of weeklyData) {
          // Group entries by project/task
          const projectTaskGroups = this.groupByProjectTask(entries);

          const categories: ITimesheetReportCategory[] = [{
            category: 'Work Items',
            items: Array.from(projectTaskGroups.values())
          }];

          // Calculate total hours for the week
          const totalHours = entries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

          // Determine overall status 
          const statuses = entries.map(e => e.status);
          let overallStatus = DailyTimesheetStatus.Draft;
          if (statuses.includes(DailyTimesheetStatus.Approved)) {
            overallStatus = DailyTimesheetStatus.Approved;
          } else if (statuses.includes(DailyTimesheetStatus.Rejected)) {
            overallStatus = DailyTimesheetStatus.Rejected;
          } else if (statuses.includes(DailyTimesheetStatus.Pending)) {
            overallStatus = DailyTimesheetStatus.Pending;
          }

          reportData.push({
            employeeId: userId,
            employeeName: `${user.firstName} ${user.lastName}`,
            employeeEmail: user.email,
            weekStartDate: new Date(weekStartDate),
            timesheetId: `${userId}_${weekStartDate}`, 
            status: overallStatus,
            submissionDate: overallStatus !== DailyTimesheetStatus.Draft ? 
              this.getLatestDate(entries, 'updatedAt') : undefined,
            approvalDate: overallStatus === DailyTimesheetStatus.Approved ? 
              this.getLatestDate(entries, 'updatedAt') : undefined,
            rejectionReason: entries.find(e => e.status === DailyTimesheetStatus.Rejected)?.rejectionReason,
            categories,
            totalHours
          });
        }
      }
    }

    // Generate report based on format
    if (format === ReportFormat.EXCEL) {
      const generator = new ExcelReportGenerator();
      generator.generateDetailedTimesheetReport(reportData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    } else {
      // Transform data for PDF generator
      const pdfReportData = reportData.map(data => ({
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        weekStartDate: typeof data.weekStartDate === 'string' ? 
          data.weekStartDate : 
          new Date(data.weekStartDate).toISOString().slice(0, 10),
        status: data.status,
        categories: data.categories.map(category => ({
          category: category.category,
          items: category.items.map(item => ({
            work: item.work,
            projectName: item.projectName,
            teamName: item.teamName,
            dailyHours: Array.isArray(item.dailyHours) ? 
              item.dailyHours.map(h => typeof h === 'number' ? h : Number(h) || 0) : 
              Array(7).fill(0),
            totalHours: item.totalHours
          }))
        })),
        totalHours: data.totalHours
      }));

      const generator = new PDFReportGenerator();
      generator.generateDetailedTimesheetReport(pdfReportData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    }
  }

  
  
  private static groupTimesheetsByUser(timesheets: any[]): Map<string, any[]> {
    const userMap = new Map<string, any[]>();

    for (const timesheet of timesheets) {
      const userId = timesheet.userId._id.toString();

      if (!userMap.has(userId)) {
        userMap.set(userId, []);
      }
      const array = userMap.get(userId);
      if (array) {
        array.push(timesheet);
      }
    }

    return userMap;
  }

  
  private static groupTimesheetsByWeekForUser(timesheets: any[]): Map<string, any[]> {
    const weeklyMap = new Map<string, any[]>();

    for (const timesheet of timesheets) {
      const weekStart = this.getWeekStartDate(timesheet.date);

      if (!weeklyMap.has(weekStart)) {
        weeklyMap.set(weekStart, []);
      }
      const array = weeklyMap.get(weekStart);
      if (array) {
        array.push(timesheet);
      }
    }

    return weeklyMap;
  }

  // Group daily timesheets by user and week
  private static groupTimesheetsByWeek(timesheets: any[]): Map<string, any[]> {
    const weeklyMap = new Map<string, any[]>();

    for (const timesheet of timesheets) {
      const userId = timesheet.userId._id.toString();
      const weekStart = this.getWeekStartDate(timesheet.date);
      const key = `${userId}_${weekStart}`;

      if (!weeklyMap.has(key)) {
        weeklyMap.set(key, []);
      }
      const array = weeklyMap.get(key);
      if (array) {
        array.push(timesheet);
      }
    }

    return weeklyMap;
  }

  
  // Get Monday (week start) for a given date
  private static getWeekStartDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().slice(0, 10);
  }

  
  // Group daily timesheet entries by project/task combination
  // Aggregates individual daily records into weekly views by project/task
  // Input: Array of daily timesheet entries (for one week)
  // Output: Map of items with daily hours distributed across the week
  private static groupByProjectTask(timesheets: any[]): Map<string, ITimesheetReportDataItem> {
    const groups = new Map<string, any[]>();

    // First, group daily entries by their project/task combination
    for (const timesheet of timesheets) {
      const projectId = timesheet.projectId?._id?.toString() || 'none';
      const taskId = timesheet.taskId?._id?.toString() || 'none';
      const key = `${projectId}_${taskId}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      const array = groups.get(key);
      if (array) {
        array.push(timesheet);
      }
    }

    // Transform to report items
    const items = new Map<string, ITimesheetReportDataItem>();

    for (const [key, entries] of groups) {
      const firstEntry = entries[0];
      const projectName = firstEntry.projectId?.projectName || 'No Project';
      const taskName = firstEntry.taskId?.taskName || 'No Task';
      
      // Create 7-day arrays (Monday to Sunday)
      const dailyHours: number[] = Array(7).fill(0);
      const dailyDescriptions: string[] = Array(7).fill('');
      const dailyStatus: DailyTimesheetStatus[] = Array(7).fill(DailyTimesheetStatus.Draft);

      let totalHours = 0;

      // Fill in the data for each day
      for (const entry of entries) {
        const entryDate = new Date(entry.date);
        const dayOfWeek = entryDate.getDay();
        const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday=0, Sunday=6

        dailyHours[dayIndex] = entry.hours || 0;
        dailyDescriptions[dayIndex] = entry.description || '';
        dailyStatus[dayIndex] = entry.status || DailyTimesheetStatus.Draft;
        totalHours += entry.hours || 0;
      }

      items.set(key, {
        work: `${projectName} - ${taskName}`,
        projectId: firstEntry.projectId?._id?.toString(),
        projectName: projectName,
        teamId: undefined, // No team in new structure
        teamName: undefined,
        dailyHours,
        dailyDescriptions,
        dailyStatus,
        totalHours
      });
    }

    return items;
  }

  
  // Get status priority for comparison
  private static getStatusPriority(status: DailyTimesheetStatus): number {
    const priorities: Record<DailyTimesheetStatus, number> = {
      [DailyTimesheetStatus.Rejected]: 4,
      [DailyTimesheetStatus.Pending]: 3,
      [DailyTimesheetStatus.Approved]: 2,
      [DailyTimesheetStatus.Draft]: 1,
      [DailyTimesheetStatus.Default]: 0
    };
    return priorities[status] || 0;
  }

  // Get the latest date from a set of entries
  private static getLatestDate(entries: any[], field: 'updatedAt' | 'createdAt'): Date | undefined {
    const dates = entries
      .map(e => e[field])
      .filter(d => d != null)
      .map(d => new Date(d));
    
    return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : undefined;
  }

  
   // Get available employees for a supervisor
  static async getSupervisedEmployees(supervisorId: string) {
    const supervisedUserIds = await getSupervisedUserIds(supervisorId);
    
    return await UserModel.find({
      _id: { $in: supervisedUserIds },
      status: true
    }).select('firstName lastName email').sort({ firstName: 1, lastName: 1 });
  }


}
