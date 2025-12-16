import PopupLayout from '../../templates/popup/PopUpLayout';
import { useState } from 'react';
import { IEmployee } from '../../../interfaces/user/IUser';
import { useForm } from 'react-hook-form';
import AddEmployeePopup from './AddEmployeePopup';
import { UserRole } from '@tms/shared';
import { CreateTeamFormData, CreateTeamPopupProps } from '../../../interfaces/team/ITeam';
import CreateTeamForm from '../../molecules/team/CreateTeamForm';
import { useTeam } from '../../../hooks/team';


function CreateDeptPopUp({ open, onClose, onTeamCreated }: CreateTeamPopupProps) {
  const { createTeam, loading: teamLoading } = useTeam();
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>(
    []
  );
  
  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
    reset,
  } = useForm<CreateTeamFormData>({
    mode: 'onChange',
    defaultValues: {
      teamName: '',
      supervisor: '',
      isDepartment: true,
    },
  });

  const handleOpenEmployeeDialog = () => {
    setOpenEmployeeDialog(true);
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
  };

  const handleCancel = () => {
    onClose();
  };
  
  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
  };
  
  const onSubmit = async (data: CreateTeamFormData) => {
    try {
      await createTeam({
        teamName: data.teamName,
        employees: selectedEmployees.map((e) => e._id),
        supervisor: data.supervisor || null,
        isDepartment: data.isDepartment,
      });
      reset();
      setSelectedEmployees([]);
      onTeamCreated?.(); // Callback to refresh teams list
      onClose();
    } catch (error) {
      console.error('Failed to create team:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleSaveEmployees = (employees: IEmployee[]) => {
    setSelectedEmployees(employees);
    setOpenEmployeeDialog(false);
  };

  return (
    <>
      <PopupLayout
        open={open}
        title="Create Teams"
        onClose={onClose}
        maxWidth="xs"
        paperHeight="75vh"
      >
        <CreateTeamForm
          control={control}
          isValid={isValid}
          isSubmitting={isSubmitting || teamLoading}
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
        roles={[UserRole.Emp, UserRole.Supervisor, UserRole.SupervisorAdmin, UserRole.Admin]}
      />
    </>
  );
}

export default CreateDeptPopUp;
