import MainLayout from '../components/templates/other/MainLayout';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import HistoryIcon from '@mui/icons-material/History';
import MyTimesheetWindow from '../components/organisms/window/MyTimesheetWindow';


const AdminPage = () => {

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
      <MyTimesheetWindow/>
    </MainLayout>
  );
};

export default AdminPage;
