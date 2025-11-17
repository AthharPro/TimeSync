import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function ProjectWindow() {
  return (
    <WindowLayout title="Project" buttons={<Button>Filter</Button>}>
      <div>Project Content</div>
    </WindowLayout>
  )
}

export default ProjectWindow;