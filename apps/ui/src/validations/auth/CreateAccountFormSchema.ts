import * as yup from 'yup';
import { contactField, emailField } from '../other/TextFieldSchema';

const CreateAccountFormSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: emailField,
  contactNumber: contactField,
  designation: yup.string().required('Designation is required'),
});

export default CreateAccountFormSchema;
