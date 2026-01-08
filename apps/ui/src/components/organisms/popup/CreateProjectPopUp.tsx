import React, { useState, useEffect } from 'react';
import AddEmployeePopup from './AddEmployeePopup';
import { IEmployee } from '../../../interfaces/user/IUser';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import CreateProjectFormSchema from '../../../validations/project/CreateProjectFormSchema';
import PopupLayout from '../../templates/popup/PopUpLayout';
import { UserRole } from '@tms/shared';
import { CreateProjectFormData, CreateProjectPopupProps } from '../../../interfaces/project/IProject';
import CreateProjectForm from '../../molecules/project/CreateProjectForm';
import { useProjects } from '../../../hooks/project/useProjects';

const CreateProjectPopUp: React.FC<CreateProjectPopupProps> = ({
  open,
  onClose,
  onProjectCreated,
}) => {
  const { createProject, loading: isCreating } = useProjects();
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>(
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
  } = useForm<CreateProjectFormData>({
    resolver: yupResolver(CreateProjectFormSchema) as any,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      projectName: '',
      description: '',
      projectVisibility: 'private',
      billable: undefined,
      projectType: undefined,
      costCenter: undefined,
      clientName: '',
      supervisor: null,
    },
  });

  // Watch the projectVisibility field
  const projectVisibility = watch('projectVisibility');

  // Reset form when modal closes or opens
  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      reset();
      setSelectedEmployees([]);
    }
  }, [open, reset]);

  const handleCancel = () => {
    // Just close the modal, form reset will be handled by useEffect
    onClose();
  };

  const handleOpenEmployeeDialog = () => {
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };

  const handleSaveEmployees = (employees: IEmployee[]) => {
    setSelectedEmployees(employees);
    setOpenEmployeeDialog(false);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const isPublic = data.projectVisibility === 'public';
      
      // Map form data to API format
      const projectData = {
        projectName: data.projectName,
        clientName: isPublic ? undefined : data.clientName,
        billable: isPublic ? undefined : (data.billable === 'yes' ? 'Billable' : 'Non Billable'),
        costCenter: isPublic ? undefined : data.costCenter,
        projectType: isPublic ? undefined : data.projectType,
        employees: isPublic ? [] : selectedEmployees.map((emp) => ({ user: emp.id, allocation: emp.allocation ?? 0 })),
        supervisor: isPublic ? null : (data.supervisor || null),
        description: data.description,
        isPublic: isPublic,
        startDate: isPublic ? null : (data.startDate || null),
        endDate: isPublic ? null : (data.endDate || null),
      };

      await createProject(projectData);
      
      
      onProjectCreated?.();
      onClose();
    } catch (error) {
      
    }
  };

  return (
   <>
      <PopupLayout open={open} title="Create Project" onClose={handleCancel} maxWidth='md'>
        <CreateProjectForm
          control={control}
          errors={errors}
          isValid={isValid}
          isSubmitting={isSubmitting}
          selectedEmployees={selectedEmployees}
          onAddEmployeesClick={handleOpenEmployeeDialog}
          onRemoveEmployee={handleRemoveEmployee}
          onCancel={handleCancel}
          onSubmit={handleSubmit(onSubmit)}
          projectVisibility={projectVisibility}
        />
      </PopupLayout>

      {/* Add Employee Popup */}
      <AddEmployeePopup
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        onSave={handleSaveEmployees}
        initialSelectedEmployees={selectedEmployees}
      />
    </>
  );
};

export default CreateProjectPopUp;
