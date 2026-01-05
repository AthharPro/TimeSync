import React from 'react';
import CenterContainerLayout from '../components/templates/auth/CenterContainerLayout';
import PasswordReset from '../components/organisms/auth/PasswordReset';

const PasswordResetPage: React.FC = () => {
  return (
    <CenterContainerLayout>
      <PasswordReset />
    </CenterContainerLayout>
  );
};

export default PasswordResetPage;
