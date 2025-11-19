import * as yup from 'yup';
import { confirmPasswordField ,NewpasswordField} from '../other/TextFieldSchema';

const FirstLoginPasswordRestSchema = yup.object().shape({
  newPassword: NewpasswordField,
  confirmPassword: confirmPasswordField('newPassword'),
});

export default FirstLoginPasswordRestSchema;
