import * as yup from 'yup'; 

const CreateProjectFormSchema: yup.ObjectSchema<{
  projectName: string;
  description: string;
  projectVisibility: string;
  billable: 'yes' | 'no';
  supervisor?: string | null;
  costCenter: 'Canada' | 'Australia' | 'Sweden' | 'Sri Lanka';
  clientName?: string;
  projectType: 'Fixed Bid' | 'T&M' | 'Retainer';
}> = yup.object({
  projectName: yup.string().required('Project name is required'),
  description: yup.string().trim().min(1, 'Description is required').required('Description is required'),
  projectVisibility: yup.string().required('Project visibility is required'),
  billable: yup
    .mixed<'yes' | 'no'>()
    .oneOf(['yes', 'no'])
    .required('Billable status is required'),
  supervisor: yup.string().nullable().optional().default(null),
  costCenter: yup
    .mixed<'Canada' | 'Australia' | 'Sweden' | 'Sri Lanka'>()
    .oneOf(['Canada', 'Australia', 'Sweden', 'Sri Lanka'])
    .required('Cost center is required'),
  clientName: yup.string().optional(),
  projectType: yup
    .mixed<'Fixed Bid' | 'T&M' | 'Retainer'>()
    .oneOf(['Fixed Bid', 'T&M', 'Retainer'])
    .required('Project type is required'),
});

export default CreateProjectFormSchema;
