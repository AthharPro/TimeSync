import { useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Divider,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { ITeam } from '../../../interfaces/team/ITeam';
import { updateTeamDetails } from '../../../api/team';
import { EditTeamDetailsFormData } from '../../../interfaces/team/ITeam';

interface EditTeamDetailsFormProps {
  team: ITeam;
  onClose: () => void;
  onSaved: () => void;
}

function EditTeamDetailsForm({ team, onClose, onSaved }: EditTeamDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<EditTeamDetailsFormData>({
    mode: 'onChange',
    defaultValues: {
      teamName: team.teamName,
      isDepartment: Boolean(team.isDepartment),
    },
  });

  const onSubmit = async (data: EditTeamDetailsFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updateTeamDetails(team.id, {
        teamName: data.teamName,
        isDepartment: data.isDepartment,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      console.error('Failed to update team details:', e);
      const errorMessage =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to update team details. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 5,
          gap: 5,
        }}
      >
        {error && (
          <Box sx={{ color: 'error.main', mb: 1, fontSize: 14 }}>{error}</Box>
        )}

        <Controller
          name="teamName"
          control={control}
          rules={{ required: 'Team name is required' }}
          render={({ field, fieldState }) => (
            <BaseTextField
              {...field}
              variant="outlined"
              label="Team Name"
              placeholder="Team Name"
              fullWidth
              sx={{ mb: 1 }}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
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
                    checked={Boolean(field.value)}
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
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </BaseBtn>
          <BaseBtn
            type="submit"
            sx={{ mt: 2 }}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </BaseBtn>
        </Box>
      </Box>
    </form>
  );
}

export default EditTeamDetailsForm;
