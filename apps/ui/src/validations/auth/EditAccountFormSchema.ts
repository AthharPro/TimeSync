import * as Yup from 'yup';

const EditAccountFormSchema = Yup.object().shape({
  designation: Yup.string()
    .required('Designation is required')
    .min(2, 'Designation must be at least 2 characters'),
  contactNumber: Yup.string()
    .required('Contact number is required')
    .matches(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['Active', 'Inactive'], 'Invalid status'),
});

export default EditAccountFormSchema;
