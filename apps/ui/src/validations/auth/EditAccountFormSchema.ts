import * as Yup from 'yup';

const EditAccountFormSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
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
