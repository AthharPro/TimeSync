import React, { useState, useEffect } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import PopupLayout from '../../templates/popup/PopUpLayout';
import EditProjectForm, { EditProjectFormData } from '../../molecules/project/EditProjectForm';
import ProjectStaffManager from '../project/ProjectStaffManager';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useProjects } from '../../../hooks/project/useProjects';
import { TabPanelProps } from '../../../interfaces/project/IProject';
import {EditProjectPopupProps} from '../../../interfaces/project/IProject';
import { editProjectSchema } from '../../../validations/project/EditProjectSchema';
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`edit-project-tabpanel-${index}`}
      aria-labelledby={`edit-project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}


export default function EditProjectPopup({
  open,
  onClose,
  project,
  onSaved,
}: EditProjectPopupProps) {
  const [tabValue, setTabValue] = useState(0);
  const { updateProjectDetails } = useProjects();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    watch,
    reset,
  } = useForm<EditProjectFormData>({
    resolver: yupResolver(editProjectSchema) as any,
    mode: 'onChange',
    defaultValues: {
      projectName: project.projectName,
      description: project.description,
      projectVisibility: project.projectVisibility?.toLowerCase() || 'private',
      billable: project.billable ? 'yes' : 'no',
      clientName: project.clientName || '',
      projectType: project.projectType || '',
      costCenter: project.costCenter || '',
      startDate: project.startDate ? new Date(project.startDate) : null,
      endDate: project.endDate ? new Date(project.endDate) : null,
    },
  });

  const projectVisibility = watch('projectVisibility');

  // Reset form when project changes
  useEffect(() => {
    if (open) {
      reset({
        projectName: project.projectName,
        description: project.description,
        projectVisibility: project.projectVisibility?.toLowerCase() || 'private',
        billable: project.billable ? 'yes' : 'no',
        clientName: project.clientName || '',
        projectType: project.projectType || '',
        costCenter: project.costCenter || '',
        startDate: project.startDate ? new Date(project.startDate) : null,
        endDate: project.endDate ? new Date(project.endDate) : null,
      });
      setTabValue(0);
    }
  }, [open, project, reset]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      await updateProjectDetails(project.id, {
        projectName: data.projectName,
        description: data.description,
        projectVisibility: data.projectVisibility,
        billable: data.billable === 'yes',
        clientName: data.clientName,
        projectType: data.projectType,
        costCenter: data.costCenter,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const projectInitialSupervisor = project.teamMembers.find(
    (member) => member.id === project.supervisor
  )
    ? {
        id: project.supervisor!,
        name: project.teamMembers.find((m) => m.id === project.supervisor)!.name,
        designation: project.teamMembers.find((m) => m.id === project.supervisor)!.role,
      }
    : null;

  return (
    <PopupLayout
      open={open}
      onClose={onClose}
      title="Edit Project"
      subtitle="Update project details and manage team members"
      maxWidth="lg"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="edit project tabs">
          <Tab label="Project Details" id="edit-project-tab-0" />
          <Tab label="Staff Manager" id="edit-project-tab-1" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <EditProjectForm
          control={control}
          errors={errors}
          isValid={isValid}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={handleSubmit(onSubmit)}
          projectVisibility={projectVisibility}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <ProjectStaffManager
          open={open && tabValue === 1}
          onClose={onClose}
          projectId={project.id}
          initialEmployees={project.teamMembers.map((member) => ({
            id: member.id,
            name: member.name,
            designation: member.role,
            allocation: member.allocation ?? 0,
          }))}
          initialSupervisor={projectInitialSupervisor}
          onSaved={onSaved}
          isEmbedded={true}
        />
      </TabPanel>
    </PopupLayout>
  );
}
