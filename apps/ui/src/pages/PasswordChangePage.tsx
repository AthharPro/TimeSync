import React from 'react';
import CenterContainerLayout from '../components/templates/auth/CenterContainerLayout';
import PasswordChange from '../components/organisms/auth/PasswordChange';

const PasswordChangePage: React.FC = () => {
  return (
    <CenterContainerLayout>
      <PasswordChange />
    </CenterContainerLayout>
  );
};

export default PasswordChangePage;
