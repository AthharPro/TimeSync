import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function ReviewTimesheetWindow() {
  return (
    <WindowLayout title="Review Timesheet" buttons={<Button>Filter</Button>}>
      <div>Review Timesheet Window Content</div>
    </WindowLayout>
  )
}

export default ReviewTimesheetWindow;
