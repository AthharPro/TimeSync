import { useState, useEffect } from 'react';
import { UserFilterType, UseUserFilterTypeOptions } from '../../interfaces/report/IReportFilter';
import { TeamListItem } from '../../interfaces/report/IReportFilter';
import { ProjectListItem } from '../../interfaces/report/IReportFilter';
import { ReportEmployee } from '../../interfaces/report/IReportFilter';
import { getAllTeams } from '../../api/team';
import { listProjects } from '../../api/project';
import { getUsers } from '../../api/user';
import { UserRole } from '@tms/shared';
import { UseUserFilterTypeReturn } from '../../interfaces/report/IReportFilter';


export const useUserFilterType = ({ 
  userRole,
  canSeeAllData 
}: UseUserFilterTypeOptions): UseUserFilterTypeReturn => {
  const [userFilterType, setUserFilterType] = useState<UserFilterType>('' as UserFilterType);
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [users, setUsers] = useState<ReportEmployee[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Determine available filter options based on user role
  const availableFilterOptions: UserFilterType[] = 
    userRole === UserRole.Admin || userRole === UserRole.SupervisorAdmin
      ? ['individual', 'team', 'project']
      : ['individual'];

  // Load teams and projects for Admin/SupervisorAdmin
  useEffect(() => {
    if (!canSeeAllData) return;

    const loadTeamsAndProjects = async () => {
      setIsLoadingTeams(true);
      setIsLoadingProjects(true);

      try {
        const [teamsResponse, projectsResponse] = await Promise.all([
          getAllTeams(),
          listProjects(),
        ]);

        setTeams(teamsResponse.teams || []);
        setProjects(projectsResponse.projects || []);
      } catch (error) {
        console.error('Failed to load teams and projects:', error);
        // Reset to empty arrays on error
        setTeams([]);
        setProjects([]);
      } finally {
        setIsLoadingTeams(false);
        setIsLoadingProjects(false);
      }
    };

    loadTeamsAndProjects();
  }, [canSeeAllData]);

  // Load all users from database when filterType is 'individual'
  useEffect(() => {
    if (userFilterType !== 'individual') {
      setUsers([]);
      return;
    }

    const loadUsers = async () => {
      setIsLoadingUsers(true);

      try {
        const usersResponse = await getUsers();
        setUsers(usersResponse || []);
      } catch (error) {
        console.error('Failed to load users:', error);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [userFilterType]);

  const resetFilterType = () => {
    setUserFilterType('' as UserFilterType);
    setSelectedTeamId('');
    setSelectedProjectId('');
  };

  return {
    userFilterType,
    setUserFilterType,
    availableFilterOptions,
    teams,
    selectedTeamId,
    setSelectedTeamId,
    isLoadingTeams,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    isLoadingProjects,
    users,
    isLoadingUsers,
    resetFilterType,
  };
};
