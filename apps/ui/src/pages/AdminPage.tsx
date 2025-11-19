import MainLayout from '../components/templates/other/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import MyTimesheetWindow from '../components/organisms/window/MyTimesheetWindow';
import { useWindowNavigation } from '../hooks/useWindowNavigation';
import { useEffect } from 'react';
import DashboardWindow from '../components/organisms/window/DashboardWindow';
import ProjectWindow from '../components/organisms/window/ProjectWindow';
import ReportWindow from '../components/organisms/window/ReportWindow';
import AccountWindow from '../components/organisms/window/AccountWindow';
import TeamWindow from '../components/organisms/window/TeamWindow';
import HistoryWindow from '../components/organisms/window/HistoryWindow';
import ReviewTimesheetWindow from '../components/organisms/window/ReviewTimesheetWindow';


const AdminPage = () => {
  const { selectedButton, setSelectedButton } = useWindowNavigation();

  useEffect(() => {
    setSelectedButton("Dashboard");
  }, [setSelectedButton]);

    const items = [
    [
      { text: 'Dashboard', icon: <DashboardOutlinedIcon /> },
      { text: 'Projects', icon: <LibraryBooksOutlinedIcon /> },
      { text: 'Reports', icon: <AssessmentOutlinedIcon /> },
      { text: 'Accounts', icon: <AssessmentOutlinedIcon /> },
      { text: 'Teams', icon: <BusinessOutlinedIcon /> },
      { text: 'My Timesheets', icon: <AssignmentIcon /> },
      { text: 'History', icon: <HistoryIcon /> },
      { text: 'Review Timesheets', icon: <RateReviewIcon /> },
    ]
  ];

  return (
    <MainLayout items={items}>
      {selectedButton === "Dashboard" && <DashboardWindow/>}
      {selectedButton === "Projects" && <ProjectWindow/>}
      {selectedButton === "Reports" && <ReportWindow/>}
      {selectedButton === "Accounts" && <AccountWindow/>}
      {selectedButton === "Teams" && <TeamWindow/>}
      {selectedButton === "My Timesheets" && <MyTimesheetWindow />}
      {selectedButton === "History" && <HistoryWindow/>}
      {selectedButton === "Review Timesheets" && <ReviewTimesheetWindow/>}
    </MainLayout>
  );
};

export default AdminPage;
