import * as yup from 'yup';

export const emailField = yup
  .string()
  .required('Email is required')
  .email('Invalid email address');

export const passwordField = yup.string().required('password is required');

export const NewpasswordField = yup
  .string()
  .required('New password is required')
  .min(8, 'Password must be at least 8 characters')
  .max(12, 'Password must be at most 12 characters')
  .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Must contain at least one lowercase letter')
  .matches(/\d/, 'Must contain at least one number')
  .matches(
    /[@$!%*?&#^(){}[\]<>+=~|\\/:;"',.-]/,
    ' At least one special character'
  );

export const confirmPasswordField = (refKey = 'password') =>
  yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref(refKey)], 'Passwords must match with new password');

export const contactField = yup
  .string()
  .required("Contact number is required")
  .matches(/^\d{10}$/, "Contact number must be exactly 10 digits")
  .length(10, "Contact number must be exactly 10 digits");
 