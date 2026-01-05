import React, { useState } from 'react';
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
  } = useForm<CreateProjectFormData>({
    resolver: yupResolver(CreateProjectFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      projectName: '',
      description: '',
      projectVisibility: '',
      billable: undefined,
      projectType: undefined,
      costCenter: undefined,
      clientName: '',
      supervisor: null,
    },
  });

  const handleCancel = () => {
    onClose();
    reset();
    setSelectedEmployees([]);
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
      // Map form data to API format
      const projectData = {
        projectName: data.projectName,
        clientName: data.clientName,
        billable: data.billable === 'yes' ? 'Billable' : 'Non Billable',
        costCenter: data.costCenter,
        projectType: data.projectType,
        employees: selectedEmployees.map((emp) => ({ user: emp.id, allocation: emp.allocation ?? 0 })),
        supervisor: data.supervisor || null,
        description: data.description,
        isPublic: data.projectVisibility === 'Public',
        startDate: data.startDate || null,
        endDate: data.endDate || null,
      };

      await createProject(projectData);
      
      // Reset form and close modal
      reset();
      setSelectedEmployees([]);
      onProjectCreated?.();
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      // Error is handled by Redux, but you could show a toast notification here
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
