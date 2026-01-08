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
import { Controller, Control } from 'react-hook-form';
import { useTheme } from '@mui/material/styles';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import EmployeeSection from '../../organisms/common/EmployeeSection';
import { IEmployee } from '../../../interfaces/user/IUser';
import { CreateTeamFormData } from '../../../interfaces/team/ITeam';
import { CreateTeamFormProps } from '../../../interfaces/team/ITeam';
function CreateTeamForm({
  control,
  isValid,
  isSubmitting,
  selectedEmployees,
  onAddEmployeesClick,
  onRemoveEmployee,
  onCancel,
  onSubmit,
}: CreateTeamFormProps) {
  const theme = useTheme();

  return (
    <form onSubmit={onSubmit}>
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
          onAddEmployeesClick={onAddEmployeesClick}
          onRemoveEmployee={onRemoveEmployee}
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
            onClick={onCancel}
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
  );
}

export default CreateTeamForm;
