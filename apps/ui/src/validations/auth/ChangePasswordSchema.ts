import * as yup from 'yup';
import { confirmPasswordField ,NewpasswordField} from '../other/TextFieldSchema';

const ChangePasswordSchema = yup.object().shape({
  newPassword: NewpasswordField,
  confirmPassword: confirmPasswordField('newPassword'),
});

export default ChangePasswordSchema;
