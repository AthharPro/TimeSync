import MainLayout from '../components/templates/other/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { useWindowNavigation } from '../hooks/useWindowNavigation';
import { useEffect } from 'react';
import DashboardWindow from '../components/organisms/window/DashboardWindow';
import AccountWindow from '../components/organisms/window/AccountWindow';

const SuperAdminPage = () => {
  const { selectedButton, setSelectedButton } = useWindowNavigation();

  useEffect(() => {
    setSelectedButton("Dashboard");
  }, [setSelectedButton]);

    const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Accounts', icon: <AssessmentOutlinedIcon /> }
    ]
  ];

  return (
    <MainLayout items={items}>
      {selectedButton === "Dashboard" && <DashboardWindow/>}
      {selectedButton === "Accounts" && <AccountWindow/>}
    </MainLayout>
  );
};

export default SuperAdminPage;
