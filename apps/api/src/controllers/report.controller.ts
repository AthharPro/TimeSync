import { RequestHandler } from 'express';
import { Timesheet } from '../models/timesheet.model';
import TeamModel from '../models/team.model';
import {UserModel} from '../models/user.model';
import ProjectModel from '../models/project.model';
import appAssert  from '../utils/validation/appAssert';
import { FORBIDDEN } from '../constants/http';
import { UserRole, DailyTimesheetStatus, REPORT_METADATA } from '@tms/shared';
import { DetailedTimesheetExcel } from '../utils/report/excel/generator/DetailedTimesheetExcel';
import { TimesheetEntriesExcel } from '../utils/report/excel/generator/TimesheetEntriesExcel';
import { 
  DetailedTimesheetPdf
} from '../utils/report/pdf/generator/DetailedTimesheetPdf';
import { TimesheetEntriesPdf } from '../utils/report/pdf/generator/TimesheetEntriesPdf';
import { getSupervisedUserIds } from '../utils/data/assignmentUtils';
import { createWeekOverlapQuery } from '../utils/report/date/dateFilterUtils';
import mongoose from 'mongoose';

type ReportFormat = 'pdf' | 'excel';

const parseDate = (value?: string) => (value ? new Date(value) : undefined);

const formatDateForDisplay = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10); 
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday (week start)
  return new Date(d.setDate(diff));
};

// Transform individual daily timesheet entries into weekly aggregated format
// Database stores one document per day per project/task
// This function groups those daily entries into weekly buckets (Monday to Sunday)
// and organizes them by category (Project/Team) and work items
const transformDailyToWeekly = (dailyTimesheets: any[]): any[] => {
  // Group timesheets by user and week
  const weeklyMap = new Map<string, any>();
  
  // Process each daily timesheet entry and aggregate into weekly structure
  dailyTimesheets.forEach((entry: any) => {
    const weekStart = getWeekStart(new Date(entry.date));
    const weekKey = `${entry.userId}_${weekStart.toISOString()}`;
    
    if (!weeklyMap.has(weekKey)) {
      weeklyMap.set(weekKey, {
        userId: entry.userId,
        weekStartDate: weekStart,
        status: entry.status || DailyTimesheetStatus.Draft,
        data: []
      });
    }
    
    const weekEntry = weeklyMap.get(weekKey);
    const day = new Date(entry.date).getDay();
    const dayIndex = day === 0 ? 6 : day - 1; // Convert to Monday=0, Sunday=6
    
    // Determine category based on whether it's project or team work
    const category = entry.projectId ? 'Project' : 'Team';
    
    // Find or create category
    let categoryEntry = weekEntry.data.find((c: any) => c.category === category);
    if (!categoryEntry) {
      categoryEntry = { category, items: [] };
      weekEntry.data.push(categoryEntry);
    }
    
    // Create unique work identifier
    const workId = `${entry.projectId || ''}_${entry.taskId || ''}_${entry.teamId || ''}`;
    
    // Find or create work item
    let workItem = categoryEntry.items.find((item: any) => {
      const itemId = `${item.projectId || ''}_${item.taskId || ''}_${item.teamId || ''}`;
      return itemId === workId;
    });
    
    if (!workItem) {
      workItem = {
        work: entry.description || 'Work',
        projectId: entry.projectId,
        taskId: entry.taskId,
        teamId: entry.teamId,
        hours: Array(7).fill(0),
        descriptions: Array(7).fill(''),
        dailyStatus: Array(7).fill(DailyTimesheetStatus.Draft)
      };
      categoryEntry.items.push(workItem);
    }
    
    // Add hours to the correct day
    workItem.hours[dayIndex] = entry.hours || 0;
    workItem.descriptions[dayIndex] = entry.description || '';
    workItem.dailyStatus[dayIndex] = entry.status || DailyTimesheetStatus.Draft;
  });
  
  return Array.from(weeklyMap.values());
};

const getSupervisedEmployeeIds = async (supervisorId: string): Promise<string[]> => {
  // Get all supervised user IDs 
  const supervisedIds = await getSupervisedUserIds(supervisorId);
  
  // Ensure supervisor's own ID is never included
  return supervisedIds.filter(id => id !== supervisorId);
};

export const getReportMetadataHandler: RequestHandler = async (req, res) => {
  res.json(REPORT_METADATA);
};

export const getSupervisedEmployeesHandler: RequestHandler = async (req, res) => {
  const userRole = req.userRole as UserRole;
  const supervisorId = req.userId as string;
  appAssert(
    [UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin, UserRole.SuperAdmin].includes(userRole),
    FORBIDDEN,
    'Access denied'
  );

  let employees;
  
  if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin || userRole === UserRole.SuperAdmin) {
    // Admin, SupervisorAdmin, and SuperAdmin can see all users except SuperAdmin
    employees = await UserModel.find({ 
      role: { $in: [UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin] }
    })
      .select('_id firstName lastName email')
      .lean();
  } else {
    // Supervisor can only see their supervised employees
    const memberIds = await getSupervisedEmployeeIds(supervisorId);
    employees = await UserModel.find({ _id: { $in: memberIds } })
      .select('_id firstName lastName email')
      .lean();
  }
  
  res.json({ employees });
};

const buildTimesheetQuery = async (supervisorId: string, userRole: UserRole, params: any) => {
  const { startDate, endDate, employeeIds, approvalStatus, projectIds, teamIds, filterByProjectMembers } = params as {
    startDate?: string;
    endDate?: string;
    employeeIds?: string[] | string;
    approvalStatus?: string[] | string;
    projectIds?: string[] | string;
    teamIds?: string[] | string;
    filterByProjectMembers?: boolean; // Flag to indicate we want all timesheets for project members
  };

  const memberFilter = { $in: [] as any[] };
  if (employeeIds) {
    const list = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
    memberFilter.$in = list;
  }

  const query: any = {};
  if (startDate || endDate) {
    const dateFilter = createWeekOverlapQuery(startDate, endDate);
    Object.assign(query, dateFilter);
  }

  if (approvalStatus) {
    const list = Array.isArray(approvalStatus) ? approvalStatus : [approvalStatus];
    query.status = { $in: list.filter(Boolean) };
  }

  // Only filter by projectId in timesheet data if NOT filtering by project members
  // When filtering by project members, we want ALL their timesheets, not just ones for this project
  if (projectIds && !filterByProjectMembers) {
    const list = Array.isArray(projectIds) ? projectIds : [projectIds];
    if (list.length) {
      // Convert string IDs to ObjectIds for MongoDB query
      const projectObjectIds = list.map(id => new mongoose.Types.ObjectId(id));
      query.projectId = { $in: projectObjectIds };
    }
  }

  // Handle team filtering with awareness of isDepartment property
  let teamFilterMode: 'department' | 'non-department' | 'mixed' = 'department';
  let selectedTeamIdsList: string[] = [];
  if (teamIds) {
    const list = Array.isArray(teamIds) ? teamIds : [teamIds];
    selectedTeamIdsList = list;
    console.log('Team filtering - teamIds received:', list);
    if (list.length) {
      // Check if selected teams include non-department teams
      const selectedTeams = await TeamModel.find({ _id: { $in: list } }).select('_id isDepartment').lean();
      console.log('Team filtering - Teams found in DB:', selectedTeams.length, selectedTeams);
      const hasNonDept = selectedTeams.some((t: any) => t.isDepartment === false);
      const hasDept = selectedTeams.some((t: any) => t.isDepartment !== false);
      
      if (hasNonDept && !hasDept) {
        teamFilterMode = 'non-department';
        // For non-department teams, we don't filter by teamId in the query
        // Instead, we get team members and filter by userId (handled in ensureSupervisorScope)
      } else if (hasNonDept && hasDept) {
        teamFilterMode = 'mixed';
        // For mixed teams, we don't filter by teamId in the query
        // Instead, we get team members and filter by userId (handled in ensureSupervisorScope)
      } else {
        teamFilterMode = 'department';
        // For department teams, we don't filter by teamId in the query
        // Instead, we get team members and filter by userId (handled in ensureSupervisorScope)
      }
    }
  }

  return { query, memberFilter, teamFilterMode, selectedTeamIds: selectedTeamIdsList };
};

const ensureSupervisorScope = async (
  supervisorId: string, 
  userRole: UserRole, 
  memberFilter: any,
  teamFilterMode?: 'department' | 'non-department' | 'mixed',
  selectedTeamIds?: string[],
  selectedProjectIds?: string[]
) => {
  if (userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin || userRole === UserRole.SuperAdmin) {
    // Admin, SupervisorAdmin, and SuperAdmin can access all employees except SuperAdmin
    if (memberFilter?.$in?.length) {
      // If specific employees are selected, use those
      return memberFilter.$in;
    } else if (selectedProjectIds && selectedProjectIds.length > 0) {
      // For project-wise filter, get all members of the selected projects
      const projects = await ProjectModel.find({ _id: { $in: selectedProjectIds } }).select('employees').lean();
      const projectMembers = Array.from(new Set(projects.flatMap((p: any) => p.employees.map((m: any) => String(m)))));
      return projectMembers;
    } else if (selectedTeamIds && selectedTeamIds.length > 0) {
      // For team-wise filter, get members of those teams (works for all team filter modes: department, non-department, mixed)
      const teams = await TeamModel.find({ _id: { $in: selectedTeamIds } }).select('members').lean();
      const teamMembers = Array.from(new Set(teams.flatMap((t: any) => t.members.map((m: any) => String(m)))));
      console.log('Team-wise filter - Teams found:', teams.length, 'Team members:', teamMembers.length, 'Member IDs:', teamMembers);
      return teamMembers;
    } else {
      // If no specific employees selected, get all employees except SuperAdmin
      const allEmployees = await UserModel.find({ 
        role: { $in: [UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin] }
      }).select('_id').lean();
      return allEmployees.map((emp: any) => String(emp._id));
    }
  } else {
    // Supervisor can only access their supervised employees
    const memberIds = await getSupervisedEmployeeIds(supervisorId);
    if (memberFilter?.$in?.length) {
      const scoped = memberFilter.$in.filter((id: string) => memberIds.includes(id));
      return scoped;
    } else if (selectedProjectIds && selectedProjectIds.length > 0) {
      // For project-wise filter, get members of the selected projects that are supervised
      const projects = await ProjectModel.find({ _id: { $in: selectedProjectIds } }).select('employees').lean();
      const projectMembers = Array.from(new Set(projects.flatMap((p: any) => p.employees.map((m: any) => String(m)))));
      return projectMembers.filter((id: string) => memberIds.includes(id));
    } else if (selectedTeamIds && selectedTeamIds.length > 0) {
      // For team-wise filter, get members of those teams that are supervised (works for all team filter modes: department, non-department, mixed)
      const teams = await TeamModel.find({ _id: { $in: selectedTeamIds } }).select('members').lean();
      const teamMembers = Array.from(new Set(teams.flatMap((t: any) => t.members.map((m: any) => String(m)))));
      const filteredMembers = teamMembers.filter((id: string) => memberIds.includes(id));
      console.log('Team-wise filter (Supervisor) - Teams found:', teams.length, 'Team members:', teamMembers.length, 'Supervised members:', filteredMembers.length, 'Member IDs:', filteredMembers);
      return filteredMembers;
    } else {
      return memberIds;
    }
  }
};

// Helpers to emit files
const sendExcel = async (res: any, filename: string, build: (gen: any) => void) => {
  await build;
  await (build as any);
};

export const generateDetailedTimesheetReportHandler: RequestHandler = async (req, res) => {
  const supervisorId = req.userId as string;
  const userRole = req.userRole as UserRole;
  const { format = 'excel', startDate, endDate, employeeIds, projectIds, teamIds, workType } = req.query as any;

  console.log('Report request params:', { supervisorId, userRole, startDate, endDate, employeeIds, projectIds, teamIds, workType });

  const selectedProjectIds = projectIds ? (Array.isArray(projectIds) ? projectIds : [projectIds]) : [];
  const filterByProjectMembers = selectedProjectIds.length > 0 && (!employeeIds || (Array.isArray(employeeIds) && employeeIds.length === 0));
  
  console.log('Project filter settings:', { selectedProjectIds, filterByProjectMembers, hasEmployeeIds: !!employeeIds });
  
  const { query, memberFilter, teamFilterMode, selectedTeamIds } = await buildTimesheetQuery(supervisorId, userRole, { startDate, endDate, employeeIds, projectIds, teamIds, filterByProjectMembers });
  const scopedIds = await ensureSupervisorScope(supervisorId, userRole, memberFilter, teamFilterMode, selectedTeamIds, selectedProjectIds);

  // Convert string IDs to ObjectIds for MongoDB query
  const scopedObjectIds = scopedIds.map(id => new mongoose.Types.ObjectId(id));

  console.log('Query built:', query);
  console.log('Scoped employee IDs:', scopedIds);
  console.log('Scoped employee count:', scopedIds.length);
  console.log('Final query:', { ...query, userId: { $in: scopedObjectIds } });

  // Fetch individual daily timesheet entries from database
  // Each document represents one day's work on a specific project/task
  const timesheets = await Timesheet.find({ ...query, userId: { $in: scopedObjectIds } }).lean();
  console.log('Timesheets found:', timesheets.length);
  
  // Transform flat daily timesheet entries into weekly aggregated format
  // Groups by user and week, then organizes by category and work item
  const weeklyTimesheets = transformDailyToWeekly(timesheets as any[]);
  console.log('Weekly timesheets created:', weeklyTimesheets.length);
  
  const users = await UserModel.find({ _id: { $in: scopedObjectIds } }).select('_id firstName lastName email').lean();
  const userMap = new Map<string, { name: string; email: string }>();
  users.forEach((u: any) => userMap.set(String(u._id), { name: `${u.firstName} ${u.lastName}`, email: u.email }));

  // Get all unique project and team IDs
  const allProjectIds = Array.from(new Set(weeklyTimesheets.flatMap((t: any) => 
    (t.data || []).flatMap((cat: any) => 
      (cat.items || []).map((item: any) => item.projectId).filter(Boolean)
    )
  )));
  const allTeamIds = Array.from(new Set(weeklyTimesheets.flatMap((t: any) => 
    (t.data || []).flatMap((cat: any) => 
      (cat.items || []).map((item: any) => item.teamId).filter(Boolean)
    )
  )));

  // Fetch project and team names (and team isDepartment)
  const [projects, teams] = await Promise.all([
    allProjectIds.length ? ProjectModel.find({ _id: { $in: allProjectIds } }).select('_id projectName').lean() : [],
    allTeamIds.length ? TeamModel.find({ _id: { $in: allTeamIds } }).select('_id teamName isDepartment').lean() : [],
  ]);
  
  const projectMap = new Map<string, string>(projects.map((p: any) => [String(p._id), p.projectName] as [string, string]));
  const teamMap = new Map<string, string>(teams.map((t: any) => [String(t._id), t.teamName] as [string, string]));
  const teamDeptMap = new Map<string, boolean>(teams.map((t: any) => [String(t._id), Boolean(t.isDepartment)] as [string, boolean]));

  // Check if any selected team filter is a non-department team
  const hasNonDeptTeamFilter = teamFilterMode === 'non-department' || teamFilterMode === 'mixed';

  const data = weeklyTimesheets.map((t: any) => {
    const user = userMap.get(String(t.userId));
    let totalTimesheetHours = 0;
    
    // Calculate week-level status based on daily statuses (Mon-Fri only)
    const weekdayIndices = [0, 1, 2, 3, 4];
    const aggregatedDayStatus: string[] = Array(7).fill(DailyTimesheetStatus.Draft);
    const dayStatusPrecedence: Record<string, number> = {
      [DailyTimesheetStatus.Rejected]: 4,
      [DailyTimesheetStatus.Pending]: 3,
      [DailyTimesheetStatus.Approved]: 2,
      [DailyTimesheetStatus.Draft]: 1,
    };

    const categories = (t.data || [])
      .filter((cat: any) => {
        if (!workType || workType === 'both') return true;
        if (workType === 'project') return cat.category === 'Project';
        if (workType === 'team') return cat.category === 'Team';
        return true;
      })
      .map((cat: any) => ({
      category: cat.category,
      items: (cat.items || [])
        .filter((item: any) => {
          if (cat.category === 'Team') {
            // If a non-department team is selected in filters, show all work
            // Otherwise, only show department team work
            const tid = item.teamId ? String(item.teamId) : '';
            if (!tid) return false;
            if (hasNonDeptTeamFilter) {
              // Show all team work when non-dept team is selected
              return true;
            }
            // Default behavior: only show department teams
            return teamDeptMap.get(tid) === true;
          }
          return true;
        })
        .map((item: any) => {
        // Calculate total hours for this item
        const dailyHours = Array.isArray(item.hours) ? item.hours : [];
        const itemTotalHours = dailyHours.reduce((sum: number, hours: number) => sum + (hours || 0), 0);
        totalTimesheetHours += itemTotalHours;
        
        // Aggregate daily statuses for week-level status calculation
        const hoursArr: number[] = dailyHours.map((h: any) => Number(h) || 0);
        const dailyStatusArr: string[] = Array.isArray(item.dailyStatus) ? item.dailyStatus : [];
        
        for (let d = 0; d < 7; d++) {
          const hasHours = (hoursArr[d] || 0) > 0;
          if (!hasHours) continue;
          
          const statusForItem = dailyStatusArr[d] || DailyTimesheetStatus.Draft;
          const currentAgg = aggregatedDayStatus[d];
          if ((dayStatusPrecedence[statusForItem] || 0) > (dayStatusPrecedence[currentAgg] || 0)) {
            aggregatedDayStatus[d] = statusForItem;
          }
        }
        
        return {
          work: item.work,
          projectId: item.projectId,
          projectName: item.projectId ? projectMap.get(String(item.projectId)) || item.projectId : '',
          teamId: item.teamId,
          teamName: item.teamId ? teamMap.get(String(item.teamId)) || item.teamId : '',
          dailyHours: dailyHours,
          dailyDescriptions: Array.isArray(item.descriptions) ? item.descriptions : [],
          dailyStatus: Array.isArray(item.dailyStatus) ? item.dailyStatus : [],
          totalHours: Math.round(itemTotalHours * 100) / 100,
        };
      }),
    }));
    
    // Determine week-level status: Rejected only if entire week (Mon-Fri) is rejected
    const isWeekFullyApproved = weekdayIndices.every((idx) => aggregatedDayStatus[idx] === DailyTimesheetStatus.Approved);
    const isWeekFullyRejected = weekdayIndices.every((idx) => aggregatedDayStatus[idx] === DailyTimesheetStatus.Rejected);
    
    const computedStatus = isWeekFullyApproved
      ? DailyTimesheetStatus.Approved
      : isWeekFullyRejected
        ? DailyTimesheetStatus.Rejected
        : DailyTimesheetStatus.Pending;
    
    return {
      employeeId: String(t.userId),
      employeeName: user?.name || 'Unknown',
      employeeEmail: user?.email || '',
      weekStartDate: formatDateForDisplay(t.weekStartDate),
      timesheetId: String(t._id),
      status: computedStatus, // Use computed week-level status
      submissionDate: t.submittedAt ? formatDateForDisplay(t.submittedAt) : null,
      approvalDate: t.approvedAt ? formatDateForDisplay(t.approvedAt) : null,
      rejectionReason: t.rejectionReason,
      totalHours: Math.round(totalTimesheetHours * 100) / 100,
      categories: categories,
    };
  });

  // Return JSON preview data (weekly aggregated view of daily timesheet entries)
  // This is used by the frontend to show a preview table before generating PDF/Excel
  if (format === 'json') {
    return res.json({ data });
  }
  if (format === 'pdf') {
    const pdf = new DetailedTimesheetPdf();
    const doc = pdf.generate(data, { startDate, endDate });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=detailed-timesheet-report.pdf');
    doc.pipe(res);
    doc.end();
    return;
  }

  const excel = new DetailedTimesheetExcel();
  excel.build(data, { startDate, endDate });
  await excel.write(res, 'detailed-timesheet-report');
};


export const generateTimesheetEntriesReportHandler: RequestHandler = async (req, res) => {
  const supervisorId = req.userId as string;
  const userRole = req.userRole as UserRole;
  const { format = 'pdf', startDate, endDate, employeeIds, projectIds, teamIds, workType } = req.query as any;

  const selectedProjectIds = projectIds ? (Array.isArray(projectIds) ? projectIds : [projectIds]) : [];
  const filterByProjectMembers = selectedProjectIds.length > 0 && (!employeeIds || (Array.isArray(employeeIds) && employeeIds.length === 0));
  
  const { query, memberFilter, teamFilterMode, selectedTeamIds } = await buildTimesheetQuery(supervisorId, userRole, { startDate, endDate, employeeIds, projectIds, teamIds, filterByProjectMembers });
  const scopedIds = await ensureSupervisorScope(supervisorId, userRole, memberFilter, teamFilterMode, selectedTeamIds, selectedProjectIds);

  // Convert string IDs to ObjectIds for MongoDB query
  const scopedObjectIds = scopedIds.map(id => new mongoose.Types.ObjectId(id));

  // Fetch individual daily timesheet entries from database
  const timesheets = await Timesheet.find({ ...query, userId: { $in: scopedObjectIds } }).lean();
  
  // Transform daily entries into weekly aggregated format for reporting
  const weeklyTimesheets = transformDailyToWeekly(timesheets as any[]);
  
  // Preload teams for isDepartment filtering if needed
  let teamDeptMap = new Map<string, boolean>();
  if (!workType || workType === 'both' || workType === 'team') {
    const allTeamIds = Array.from(new Set((weeklyTimesheets as any[]).flatMap((t: any) => (t.data || []).flatMap((c: any) => (c.items || []).map((it: any) => it.teamId).filter(Boolean)))));
    if (allTeamIds.length) {
      const teams = await TeamModel.find({ _id: { $in: allTeamIds } }).select('_id isDepartment').lean();
      teamDeptMap = new Map<string, boolean>(teams.map((t: any) => [String(t._id), Boolean(t.isDepartment)] as [string, boolean]));
    }
  }
  
  // Check if any selected team filter is a non-department team
  const hasNonDeptTeamFilter = teamFilterMode === 'non-department' || teamFilterMode === 'mixed';
  
  const users = await UserModel.find({ _id: { $in: scopedObjectIds } }).select('_id firstName lastName email').lean();
  const userMap = new Map<string, { name: string; email: string }>();
  users.forEach((u: any) => userMap.set(String(u._id), { name: `${u.firstName} ${u.lastName}`, email: u.email }));

  const dataByEmployee: Record<string, { employeeName: string; employeeEmail: string; tables: Array<{ title: string; rows: any[] }> }> = {};

  for (const t of weeklyTimesheets as any[]) {
    const user = userMap.get(String(t.userId));
    const employeeKey = String(t.userId);
    if (!dataByEmployee[employeeKey]) {
      dataByEmployee[employeeKey] = { employeeName: user?.name || 'Unknown', employeeEmail: user?.email || '', tables: [] };
    }
    const weekStart = new Date(t.weekStartDate);
    // Resolve bounds once per timesheet for per-day filtering
    const startBound = startDate ? new Date(startDate as any) : null;
    const endBound = endDate ? new Date(endDate as any) : null;
    (t.data || [])
      .filter((cat: any) => {
        if (!workType || workType === 'both') return true;
        if (workType === 'project') return cat.category === 'Project';
        if (workType === 'team') return cat.category === 'Team';
        return true;
      })
      .forEach((cat: any) => {
      (cat.items || [])
        .filter((it: any) => {
          if (cat.category === 'Team') {
            // If a non-department team is selected in filters, show all work
            // Otherwise, only show department team work
            const tid = it.teamId ? String(it.teamId) : '';
            if (!tid) return false;
            if (hasNonDeptTeamFilter) {
              // Show all team work when non-dept team is selected
              return true;
            }
            // Default behavior: only show department teams
            return teamDeptMap.get(tid) === true;
          }
          return true;
        })
        .forEach((it: any) => {
        const title = cat.category === 'Project' ? `Project: ${it.work || it.projectName || 'Project'}` : cat.category === 'Team' ? `Team: ${it.work || it.teamName || 'Team'}` : cat.category === 'Other' ? 'Leave' : cat.category;
        let table = dataByEmployee[employeeKey].tables.find((tb) => tb.title === title);
        if (!table) {
          table = { title, rows: [] };
          dataByEmployee[employeeKey].tables.push(table);
        }
        const hours: any[] = Array.isArray(it.hours) ? it.hours : [];
        const descriptions: any[] = Array.isArray(it.descriptions) ? it.descriptions : [];
        const dailyStatus: any[] = Array.isArray(it.dailyStatus) ? it.dailyStatus : [];
        for (let idx = 0; idx < 7; idx++) {
          const qty = Number(hours[idx] || 0);
          if (qty > 0) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + idx);
            const dateStr = d.toISOString().slice(0, 10);
            // Filter out daily rows outside the selected date range
            if (startBound && d < startBound) {
              continue;
            }
            if (endBound && d > endBound) {
              continue;
            }
            const descRaw = descriptions[idx] || it.description || it.task || it.tasks || '';
            const desc = (typeof descRaw === 'string' ? descRaw.trim() : String(descRaw || '')) || '-';
            const status = dailyStatus[idx] || t.status || 'Pending';
            table.rows.push({ date: dateStr, description: desc, status, quantity: String(qty) });
          }
        }
      });
    });
  }

  // Sort rows by date and employees by name
  const employees = Object.values(dataByEmployee).map((emp) => {
    emp.tables.forEach((tbl) => {
      tbl.rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return emp;
  });

  if (format === 'json') {
    return res.json({ data: employees });
  }
  if (format === 'pdf') {
    try {
      console.log('Generating PDF for timesheet entries...');
      const pdf = new TimesheetEntriesPdf();
      const doc = pdf.generate(employees, { startDate, endDate });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=timesheet-entries-report.pdf');
      doc.pipe(res);
      doc.end();
      console.log('PDF generation completed successfully');
      return;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  if (format === 'excel') {
    try {
      console.log('Generating Excel for timesheet entries...');
      const excel = new TimesheetEntriesExcel();
      excel.build(employees, { startDate, endDate });
      await excel.write(res, 'timesheet-entries-report');
      console.log('Excel generation completed successfully');
      return;
    } catch (error) {
      console.error('Error generating Excel:', error);
      throw error;
    }
  }
};





