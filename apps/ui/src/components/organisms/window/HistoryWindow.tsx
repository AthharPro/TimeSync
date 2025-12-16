import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'
import HistoryTable from '../table/HistoryTable'

function HistoryWindow() {
  return (
    <WindowLayout title="History" buttons={<Button>Filter</Button>}>
      <HistoryTable />
    </WindowLayout>
  )
}

export default HistoryWindow;