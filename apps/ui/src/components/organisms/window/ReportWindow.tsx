import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function ReportWindow() {
  return (
    <WindowLayout title="Report" buttons={<Button>Filter</Button>}>
      <div>Report Content</div>
    </WindowLayout>
  )
}

export default ReportWindow;