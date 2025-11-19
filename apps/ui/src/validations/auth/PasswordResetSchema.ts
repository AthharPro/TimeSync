import { emailField } from "../other/TextFieldSchema";
import * as yup from 'yup';

const PasswordResetFormSchema = yup.object().shape({
  email: emailField
});

export default PasswordResetFormSchema;