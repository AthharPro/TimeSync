import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box
} from '@mui/material';
import { BaseBtn } from '../../atoms';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface EditRequestDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (month: string, year: string) => void;
}

const EditRequestDialog: React.FC<EditRequestDialogProps> = ({ open, onClose, onConfirm }) => {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs().subtract(1, 'month'));

  const handleConfirm = () => {
    if (selectedDate) {
      const month = selectedDate.format('YYYY-MM');
      const year = selectedDate.format('YYYY');
      onConfirm(month, year);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Request Edit Permission</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Month"
              views={['year', 'month']}
              value={selectedDate}
              onChange={(newValue) => {
                if (newValue) {
                  setSelectedDate(dayjs(newValue));
                } else {
                  setSelectedDate(null);
                }
              }}
              maxDate={dayjs()}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: 'Select the month you want to edit timesheets for'
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <BaseBtn onClick={onClose} variant="outlined">
          Cancel
        </BaseBtn>
        <BaseBtn onClick={handleConfirm} variant="contained" disabled={!selectedDate}>
          Request
        </BaseBtn>
      </DialogActions>
    </Dialog>
  );
};

export default EditRequestDialog;
