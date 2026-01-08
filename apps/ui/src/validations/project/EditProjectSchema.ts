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
  startDate: yup.date().nullable().when('projectVisibility', {
    is: (val: string) => val !== 'public',
    then: (schema) => schema.required('Start date is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  endDate: yup
    .date()
    .nullable()
    .when(['projectVisibility', 'startDate'], {
      is: (visibility: string, startDate: Date) => visibility !== 'public' && startDate,
      then: (schema) =>
        schema
          .required('End date is required')
          .min(yup.ref('startDate'), 'End date must be after start date'),
      otherwise: (schema) => schema.notRequired(),
    }),
});