import WindowLayout from '../../templates/other/WindowLayout'
import { Button } from '@mui/material'

function AccountWindow() {
  return (
    <WindowLayout title="Account" buttons={<Button>Filter</Button>}>
      <div>Account  Content</div>
    </WindowLayout>
  )
}

export default AccountWindow;