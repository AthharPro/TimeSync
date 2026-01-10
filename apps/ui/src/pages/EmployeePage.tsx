import MainLayout from '../components/templates/other/MainLayout';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MyTimesheetWindow from '../components/organisms/window/MyTimesheetWindow';
import { useWindowNavigation } from '../hooks/useWindowNavigation';
import { useEffect } from 'react';
import ReviewTimesheetWindow from '../components/organisms/window/ReviewTimesheetWindow';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '@tms/shared';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ReportWindow from '../components/organisms/window/ReportWindow';

const EmployeePage = () => {
  const { selectedButton, setSelectedButton } = useWindowNavigation();

  const {user} = useAuth();

  useEffect(() => {
    setSelectedButton("My Timesheets");
  }, [setSelectedButton]);

  const items = [
    [
      { text: 'My Timesheets', icon: <AssignmentIcon /> },
      ...(user?.role === UserRole.Supervisor 
        ? [
            { text: 'Review Timesheets', icon: <RateReviewIcon /> },
            { text: 'Reports', icon: <AssessmentOutlinedIcon /> }
          ] 
        : [])
    ]
  ];

  return (
    <MainLayout items={items}>
      {selectedButton === "My Timesheets" && <MyTimesheetWindow />}
      {selectedButton === "Review Timesheets" && <ReviewTimesheetWindow/>}
      {selectedButton === "Reports" && <ReportWindow onReset={() => undefined}/>}
    </MainLayout>
  );
};

export default EmployeePage;
