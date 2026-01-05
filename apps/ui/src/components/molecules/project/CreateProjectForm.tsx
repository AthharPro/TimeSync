import React from 'react';
import { Box } from '@mui/material';
import BaseTextField from '../../atoms/other/inputField/BaseTextField';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import EmployeeSection from '../../organisms/common/EmployeeSection';
import { IEmployee } from '../../../interfaces/user/IUser';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Divider from '@mui/material/Divider';
import SupervisorSelector from '../common/SupervisorSelector';
import BillableSelect from './BillableSelect';
import ProjectType from './ProjectType';
import CostCenterSelect from './CostCenter';
import ProjectVisibility from './ProjectVisibility';
import { CreateProjectFormProps } from '../../../interfaces/project/IProject';
import DatePickerAtom from '../../atoms/report/DatePickerAtom';
import dayjs from 'dayjs';

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  control,
  errors,
  isValid,
  isSubmitting,
  selectedEmployees,
  onAddEmployeesClick,
  onRemoveEmployee,
  onCancel,
  onSubmit,
}) => {
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
        <Box style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
          {/* Project Name Field */}
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
        
        {/* Description Field */}
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
        <Box style={{ display: 'flex', flexDirection: 'row', gap: 5, marginBottom: 10 }}>
          {/* Project Visibility Dropdown */}
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

          {/* Billable Dropdown */}
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

        <Box style={{ display: 'flex', flexDirection: 'row', gap: 5, marginBottom: 10 }}>
          {/* Project Type Dropdown */}
          <Controller
            name="projectType"
            control={control}
            render={({ field }) => (
              <ProjectType
                value={field.value || ''}
                onChange={field.onChange}
                error={!!errors.billable}
                helperText={errors.billable?.message}
              />
            )}
          />

          {/* Cost Center Dropdown */}
          <Controller
            name="costCenter"
            control={control}
            render={({ field }) => (
              <CostCenterSelect
                value={field.value || ''}
                onChange={field.onChange}
                error={!!errors.billable}
                helperText={errors.billable?.message}
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
                  />
                )}
              />
            )}
          />
        </Box>

        {/* Employee Section */}
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
              <SupervisorSelector
                selectedEmployees={selectedEmployees}
                supervisor={field.value || ''}
                onSupervisorChange={field.onChange}
              />
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
};

export default CreateProjectForm;
