import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function MyTimesheetWindow() {
  return (
    <WindowLayout title="My Timesheet" buttons={<Button>Filter</Button>}>
      <div>My Timesheet Content</div>
    </WindowLayout>
  )
}

export default MyTimesheetWindow;