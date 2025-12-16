import { DailyTimesheetStatus } from '@tms/shared';
import appAssert from '../utils/validation/appAssert';
import { UNAUTHORIZED, BAD_REQUEST } from '../constants/http';
import { Timesheet } from '../models/timesheet.model';
import ProjectModel from '../models/project.model';
import TeamModel from '../models/team.model';
import {UserModel} from '../models/user.model';
import { 
  IReportFilter, 
  ITimesheetReportData, 
  ReportFormat
} from '../interfaces/report';
import { ExcelReportGenerator } from '../utils/report/excel';
import { PDFReportGenerator } from '../utils/report/pdf';
import { getSupervisedUserIds } from '../utils/data/assignmentUtils';
import { createWeekOverlapQuery } from '../utils/report/date/dateFilterUtils';

export class ReportService {
  
  //Generate detailed timesheet report
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

    if (filter.startDate || filter.endDate) {
      const dateFilter = createWeekOverlapQuery(filter.startDate, filter.endDate);
      Object.assign(query, dateFilter);
    }

    if (filter.employeeIds && filter.employeeIds.length > 0) {
      query.userId = { $in: filter.employeeIds.filter(id => supervisedUserIds.includes(id)) };
    }

    if (filter.approvalStatus && filter.approvalStatus.length > 0) {
      query.status = { $in: filter.approvalStatus };
    }

    // Get timesheets with user details
    const timesheets = await Timesheet.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ weekStartDate: -1 });

    // Get project and team names for the timesheets
    const projectIds = new Set<string>();
    const teamIds = new Set<string>();

    (timesheets as any[]).forEach((timesheet: any) => {
      (timesheet.data || []).forEach((category: any) => {
        (category.items || []).forEach((item: any) => {
          if (item.projectId) projectIds.add(item.projectId);
          if (item.teamId) teamIds.add(item.teamId);
        });
      });
    });

    const projects = await ProjectModel.find({ _id: { $in: Array.from(projectIds) } });
    const teams = await TeamModel.find({ _id: { $in: Array.from(teamIds) } });

    const projectMap = new Map(projects.map(p => [p._id.toString(), p.projectName]));
    const teamMap = new Map(teams.map(t => [t._id.toString(), t.teamName]));

    // Process data for detailed report
    const reportData: ITimesheetReportData[] = (timesheets as any[]).map((timesheet: any) => {
      const user = timesheet.userId as any;
      
      const categories = (timesheet.data || []).map((category: any) => ({
        category: category.category,
        items: (category.items || []).map((item: any) => ({
          work: item.work,
          projectId: item.projectId,
          projectName: item.projectId ? projectMap.get(item.projectId) : undefined,
          teamId: item.teamId,
          teamName: item.teamId ? teamMap.get(item.teamId) : undefined,
          dailyHours: item.hours || Array(7).fill('0'),
          dailyDescriptions: item.descriptions || Array(7).fill(''),
          dailyStatus: item.dailyStatus || Array(7).fill(DailyTimesheetStatus.Draft),
          totalHours: this.calculateItemTotalHours(item.hours || [])
        })) || []
      })) || [];

      return {
        employeeId: user._id.toString(),
        employeeName: `${user.firstName} ${user.lastName}`,
        employeeEmail: user.email,
        weekStartDate: timesheet.weekStartDate,
        timesheetId: timesheet._id.toString(),
        status: timesheet.status as DailyTimesheetStatus,
        submissionDate: timesheet.status !== DailyTimesheetStatus.Draft ? (timesheet.updatedAt || timesheet.createdAt) : undefined,
        approvalDate: timesheet.status === DailyTimesheetStatus.Approved ? (timesheet.updatedAt || timesheet.createdAt) : undefined,
        rejectionReason: timesheet.rejectionReason,
        categories,
        totalHours: this.calculateTotalHours(timesheet)
      };
    });

    // Generate report based on format
    if (format === ReportFormat.EXCEL) {
      const generator = new ExcelReportGenerator();
      generator.generateDetailedTimesheetReport(reportData, {
        startDate: filter.startDate?.toString(),
        endDate: filter.endDate?.toString()
      });
      return await generator.generateBuffer();
    } else {
      // Transform data for PDF generator to match IDetailedTimesheetReport interface
      const pdfReportData = reportData.map(data => ({
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        weekStartDate: typeof data.weekStartDate === 'string' ? data.weekStartDate : new Date(data.weekStartDate).toISOString().slice(0, 10),
        status: data.status,
        categories: data.categories.map(category => ({
          category: category.category,
          items: category.items.map(item => ({
            work: item.work,
            projectName: item.projectName,
            teamName: item.teamName,
            dailyHours: Array.isArray(item.dailyHours) ? item.dailyHours.map(h => typeof h === 'number' ? h : Number(h) || 0) : Array(7).fill(0),
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

  
   // Get available employees for a supervisor
  static async getSupervisedEmployees(supervisorId: string) {
    const supervisedUserIds = await getSupervisedUserIds(supervisorId);
    
    return await UserModel.find({
      _id: { $in: supervisedUserIds },
      status: true
    }).select('firstName lastName email').sort({ firstName: 1, lastName: 1 });
  }

  
    //Calculate total hours for a timesheet
  private static calculateTotalHours(timesheet: any): number {
    let total = 0;
    timesheet.data?.forEach((category: any) => {
      category.items?.forEach((item: any) => {
        if (item.hours) {
          total += this.calculateItemTotalHours(item.hours);
        }
      });
    });
    return total;
  }

  
   //Calculate total hours for a timesheet item
  private static calculateItemTotalHours(hours: string[]): number {
    return hours.reduce((total, hour) => {
      const parsed = parseFloat(hour) || 0;
      return total + parsed;
    }, 0);
  }
}
