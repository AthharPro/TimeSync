import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function TeamWindow() {
  return (
    <WindowLayout title="Team" buttons={<Button>Filter</Button>}>
      <div>Team Content</div>
    </WindowLayout>
  )
}

export default TeamWindow;