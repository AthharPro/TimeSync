import React from 'react';
import CenterContainerLayout from '../components/templates/auth/CenterContainerLayout';
import ForgetPassword from '../components/organisms/auth/ForgetPassword';

const ForgetPasswordPage: React.FC = () => {
  return( 
  <CenterContainerLayout>
    <ForgetPassword />
  </CenterContainerLayout>
  );
};

export default ForgetPasswordPage;
