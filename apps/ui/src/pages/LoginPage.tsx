import LoginLeftPanel from '../components/organisms/auth/LoginLeftPanel';
import TwoColumnLayout from '../components/templates/auth/TwoColumnLayout';
import LoginBackgroundImage from '../assets/images/LoginBackgroundImage.png';
import WebSiteLogo from '../assets/images/WebSiteLogo.png';
import LoginFormSection from '../components/organisms/auth/LoginFormSection';

const LoginPage: React.FC = () => {
  return (
    <TwoColumnLayout
      leftContent={
        <LoginLeftPanel
          icon={WebSiteLogo}
          imageSrc={LoginBackgroundImage}
          title="Welcome to TimeSync "
          description="Log your hours, monitor your tasks, and manage your day — all in one place."
        />
      }
      rightContent={<LoginFormSection />}
    />
  );
};

export default LoginPage;
