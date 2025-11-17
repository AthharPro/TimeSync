import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function HistoryWindow() {
  return (
    <WindowLayout title="History" buttons={<Button>Filter</Button>}>
      <div>History Content</div>
    </WindowLayout>
  )
}

export default HistoryWindow;