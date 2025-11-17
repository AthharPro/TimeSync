import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function DashboardWindow() {
  return (
    <WindowLayout title="Dashboard" buttons={<Button>Filter</Button>}>
      <div>Dashboard Content</div>
    </WindowLayout>
  )
}

export default DashboardWindow;