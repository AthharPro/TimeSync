import React from 'react';
import { Box } from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Divider from '@mui/material/Divider';
import BillableSelect from './BillableSelect';
import ProjectType from './ProjectType';
import CostCenterSelect from './CostCenter';
import ProjectVisibility from './ProjectVisibility';
import DatePickerAtom from '../../atoms/report/DatePickerAtom';
import dayjs from 'dayjs';
import {EditProjectFormProps} from '../../../interfaces/project/IProject';


const EditProjectForm: React.FC<EditProjectFormProps> = ({
  control,
  errors,
  isValid,
  isSubmitting,
  onCancel,
  onSubmit,
  projectVisibility,
}) => {
  const isPublic = projectVisibility === 'public';

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
        {/* Visibility Type - First Field */}
        <Box style={{ display: 'flex', flexDirection: 'row', gap: 5, marginBottom: 10 }}>
          <Controller
            name="projectVisibility"
            control={control}
            render={({ field }) => (
              <ProjectVisibility
                value={field.value || ''}
                onChange={field.onChange}
                error={!!errors.projectVisibility}
                helperText={errors.projectVisibility?.message}
              />
            )}
          />
        </Box>

        {/* Project Name Field - Always visible */}
        <Controller
          name="projectName"
          control={control}
          render={({ field }) => (
            <BaseTextField
              {...field}
              value={field.value || ''}
              label="Project Name"
              placeholder="Enter Project Name"
              variant="outlined"
              id="project-name"
              error={!!errors.projectName}
              helperText={errors.projectName?.message || ' '}
            />
          )}
        />

        {/* Description Field - Always visible */}
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <BaseTextField
              {...field}
              value={field.value || ''}
              label="Project Description"
              placeholder="Enter Project Description"
              variant="outlined"
              id="project-description"
              error={!!errors.description}
              helperText={errors.description?.message || ' '}
            />
          )}
        />

        {/* Private Project Fields - Only show when private */}
        {!isPublic && (
          <>
            {/* Billable Dropdown - Only for private projects */}
            <Box style={{ display: 'flex', flexDirection: 'row', gap: 5, marginBottom: 10 }}>
              <Controller
                name="billable"
                control={control}
                render={({ field }) => (
                  <BillableSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={!!errors.billable}
                    helperText={errors.billable?.message}
                  />
                )}
              />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
              {/* Client Name Field */}
              <Controller
                name="clientName"
                control={control}
                render={({ field }) => (
                  <BaseTextField
                    {...field}
                    value={field.value || ''}
                    label="Client Name"
                    placeholder="Enter Client Name"
                    variant="outlined"
                    id="client-name"
                    error={!!errors.clientName}
                    helperText={errors.clientName?.message || ' '}
                  />
                )}
              />
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'row', gap: 5, marginBottom: 10 }}>
              {/* Project Type Dropdown */}
              <Controller
                name="projectType"
                control={control}
                render={({ field }) => (
                  <ProjectType
                    value={(field.value as any) || ''}
                    onChange={field.onChange}
                    error={!!errors.projectType}
                    helperText={errors.projectType?.message}
                  />
                )}
              />

              {/* Cost Center Dropdown */}
              <Controller
                name="costCenter"
                control={control}
                render={({ field }) => (
                  <CostCenterSelect
                    value={(field.value as any) || ''}
                    onChange={field.onChange}
                    error={!!errors.costCenter}
                    helperText={errors.costCenter?.message}
                  />
                )}
              />
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'row', gap: 5, marginBottom: 10 }}>
              {/* Start Date */}
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePickerAtom
                    label="Start Date"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date ? date.toDate() : null)}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />

              {/* End Date */}
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field: startField }) => (
                      <DatePickerAtom
                        label="End Date"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          field.onChange(date ? date.toDate() : null)
                        }
                        minDate={
                          startField.value ? dayjs(startField.value) : undefined
                        }
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                      />
                    )}
                  />
                )}
              />
            </Box>
          </>
        )}

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
          >
            Save Changes
          </BaseBtn>
        </Box>
      </Box>
    </form>
  );
};

export default EditProjectForm;
