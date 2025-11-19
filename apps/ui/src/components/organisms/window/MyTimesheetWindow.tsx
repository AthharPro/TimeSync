import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'
import MyTimesheetTable from '../table/MyTimesheetTable';
import { useMyTimesheet } from '../../../hooks/timesheet/useMyTimesheet';
import { BillableType, DailyTimesheetStatus } from '@tms/shared';

function MyTimesheetWindow() {
        const {addNewTimesheet} = useMyTimesheet();

        const handleClick = () => {
            const newTime = {
                id: crypto.randomUUID(), // Generate unique ID
                date: new Date().toISOString(), // Convert Date to ISO string for Redux
                project: '', 
                task: '', 
                description: '', 
                hours: 0, 
                billableType: BillableType.NonBillable, 
                status: DailyTimesheetStatus.Default,
                isChecked: true 
            };
            addNewTimesheet(newTime);
        }

    const buttons = (
        <>
            <Button onClick={handleClick}>Create</Button>
            <Button>Filter</Button>
            <Button>Save As Draft</Button>
        </>
    );

  return (
    <WindowLayout title="My Timesheet" buttons={buttons}>
        <MyTimesheetTable/>
    </WindowLayout>
  )
}

export default MyTimesheetWindow;