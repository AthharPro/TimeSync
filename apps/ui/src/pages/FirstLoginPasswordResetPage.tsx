import React from 'react';
import CenterContainerLayout from '../components/templates/auth/CenterContainerLayout';
import FirstLoginPasswordReset from '../components/organisms/auth/FirstLoginPasswordReset';

const FirstLoginPasswordResetPage: React.FC = () => {
  return (
    <CenterContainerLayout>
      <FirstLoginPasswordReset />
    </CenterContainerLayout>
  );
};

export default FirstLoginPasswordResetPage;
