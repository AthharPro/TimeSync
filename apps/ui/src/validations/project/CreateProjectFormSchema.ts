import * as yup from 'yup'; 

const CreateProjectFormSchema = yup.object({
  projectName: yup.string().required('Project name is required'),
  description: yup.string().trim().min(1, 'Description is required').required('Description is required'),
  projectVisibility: yup.string().required('Project visibility is required'),
  billable: yup
    .mixed<'yes' | 'no'>()
    .oneOf(['yes', 'no'])
    .when('projectVisibility', {
      is: 'private',
      then: (schema) => schema.required('Billable status is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  supervisor: yup.string().nullable().when('projectVisibility', {
    is: 'private',
    then: (schema) => schema.optional().default(null),
    otherwise: (schema) => schema.notRequired().nullable().default(null),
  }),
  costCenter: yup
    .mixed<'Canada' | 'Australia' | 'Sweden' | 'Sri Lanka'>()
    .oneOf(['Canada', 'Australia', 'Sweden', 'Sri Lanka'])
    .when('projectVisibility', {
      is: 'private',
      then: (schema) => schema.required('Cost center is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  clientName: yup.string().optional(),
  projectType: yup
    .mixed<'Fixed Bid' | 'T&M' | 'Retainer'>()
    .oneOf(['Fixed Bid', 'T&M', 'Retainer'])
    .when('projectVisibility', {
      is: 'private',
      then: (schema) => schema.required('Project type is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
});

export default CreateProjectFormSchema;
