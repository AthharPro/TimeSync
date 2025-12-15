import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import PopupLayout from '../../templates/popup/PopUpLayout';
import {
  Box,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import EmployeeSection from '../../organisms/common/EmployeeSection';
import { useState } from 'react';
import { IEmployee } from '../../../interfaces/user/IUser';
import { useTheme } from '@mui/material/styles';
import { useForm, Controller } from 'react-hook-form';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import AddEmployeePopup from './AddEmployeePopup';
import { UserRole } from '@tms/shared';
import { CreateTeamFormData, CreateTeamPopupProps } from '../../../interfaces/team/ITeam';


function CreateDeptPopUp({ open, onClose }: CreateTeamPopupProps) {
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>(
    []
  );
  const theme = useTheme();
  
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
    console.log('Team Data:', {
      teamName: data.teamName,
      employees: selectedEmployees.map((e) => e._id),
      supervisor: data.supervisor || null,
      isDepartment: data.isDepartment,
    });
    reset();
    setSelectedEmployees([]);
    onClose();
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: 5,
              gap: 5,
            }}
          >
            <Controller
              name="teamName"
              control={control}
              render={({ field }) => (
                <BaseTextField
                  {...field}
                  variant="outlined"
                  label="Team Name"
                  placeholder="Team Name"
                  fullWidth
                  sx={{ mb: 1 }}
                />
              )}
            />
            {/* Is Department Checkbox */}
            <Box sx={{ mb: 1 }}>
              <Controller
                name="isDepartment"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Is a Department"
                  />
                )}
              />
              <FormHelperText sx={{ m: 0, mt: -0.5, ml: 4 }}>
                <span style={{ fontSize: '0.75rem' }}>
                  Check this if the team represents a department. Uncheck for organizational groups.
                </span>
              </FormHelperText>
            </Box>
            <EmployeeSection
              selectedEmployees={selectedEmployees}
              onAddEmployeesClick={handleOpenEmployeeDialog}
              onRemoveEmployee={handleRemoveEmployee}
            />
            {/* Supervisor Dropdown */}
            <Box sx={{ mb: 1 }}>
              <Controller
                name="supervisor"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel id="supervisor-select">Supervisor</InputLabel>
                    <Select
                      labelId="supervisor-select"
                      label="Supervisor"
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200,
                            backgroundColor: theme.palette.background.default,
                          },
                        },
                      }}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange((e.target.value as string) || null)
                      }
                      disabled={selectedEmployees.length === 0}
                    >
                      {selectedEmployees.map((emp) => (
                        <MenuItem
                          sx={{ bgcolor: theme.palette.background.default }}
                          key={emp._id}
                          value={emp._id}
                        >
                          {`${emp.firstName} ${emp.lastName}`}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText sx={{ m: 0, mt: 0.5 }}>
                      <span style={{ fontSize: '0.75rem' }}>
                        Choose a Team Leader from selected employees
                      </span>
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Box>
            <Box>
              <Divider />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                justifyContent: 'flex-end',
              }}
            >
              <BaseBtn
                type="button"
                sx={{ mt: 2 }}
                variant="outlined"
                onClick={handleCancel}
              >
                Cancel
              </BaseBtn>
              <BaseBtn
                type="submit"
                sx={{ mt: 2 }}
                disabled={!isValid || isSubmitting}
              >
                Create
              </BaseBtn>
            </Box>
          </Box>
        </form>
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
