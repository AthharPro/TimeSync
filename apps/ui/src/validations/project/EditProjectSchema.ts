import * as yup from 'yup';

export const editProjectSchema = yup.object().shape({
  projectName: yup.string().required('Project name is required'),
  description: yup.string().required('Project description is required'),
  projectVisibility: yup.string().required('Project visibility is required'),
  billable: yup.string().when('projectVisibility', {
    is: (val: string) => val !== 'public',
    then: (schema) => schema.required('Billable status is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  clientName: yup.string().when('projectVisibility', {
    is: (val: string) => val !== 'public',
    then: (schema) => schema.required('Client name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  projectType: yup.string().when('projectVisibility', {
    is: (val: string) => val !== 'public',
    then: (schema) => schema.required('Project type is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  costCenter: yup.string().when('projectVisibility', {
    is: (val: string) => val !== 'public',
    then: (schema) => schema.required('Cost center is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  startDate: yup
    .date()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === '' || originalValue === 'Invalid Date') return null;
      const date = new Date(originalValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .notRequired(),
  endDate: yup
    .date()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue === '' || originalValue === 'Invalid Date') return null;
      const date = new Date(originalValue);
      return isNaN(date.getTime()) ? null : date;
    })
    .notRequired()
    .test('end-date-after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      const start = new Date(startDate);
      const end = new Date(value);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return true;
      return end >= start;
    }),
});