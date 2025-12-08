import WindowLayout from '../../templates/other/WindowLayout'
import { Box, Button } from '@mui/material'

function DashboardWindow() {
  return (
    <WindowLayout title="Dashboard" buttons={<Button>Filter</Button>}>
      <div>Dashboard Content</div>
      <Box sx={{ height: '200vh',backgroundColor:'white' }}>

        fwefwefwe
      </Box>
    </WindowLayout>
  )
}

export default DashboardWindow;