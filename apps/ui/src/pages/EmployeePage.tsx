import MainLayout from '../components/templates/other/MainLayout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MyTimesheetWindow from '../components/organisms/window/MyTimesheetWindow';
import { useWindowNavigation } from '../hooks/useWindowNavigation';
import { useEffect } from 'react';
import ReviewTimesheetWindow from '../components/organisms/window/ReviewTimesheetWindow';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@tms/shared';
import RateReviewIcon from '@mui/icons-material/RateReview';

const EmployeePage = () => {
  const { selectedButton, setSelectedButton } = useWindowNavigation();

  const {user} = useAuth();

  useEffect(() => {
    // Only set default if no window is selected
    if (!selectedButton) {
      setSelectedButton("My Timesheets");
    }
  }, [selectedButton, setSelectedButton]);

  const items = [
    [
      { text: 'My Timesheets', icon: <AssignmentIcon /> },
      ...(user?.role === UserRole.Supervisor 
        ? [{ text: 'Review Timesheets', icon: <RateReviewIcon /> }] 
        : [])
    ]
  ];

  return (
    <MainLayout items={items}>
      {selectedButton === "My Timesheets" && <MyTimesheetWindow />}
      {selectedButton === "Review Timesheets" && <ReviewTimesheetWindow/>}
    </MainLayout>
  );
};

export default EmployeePage;
