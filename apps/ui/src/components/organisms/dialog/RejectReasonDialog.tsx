import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';

interface RejectReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  timesheetCount: number;
}

const RejectReasonDialog: React.FC<RejectReasonDialogProps> = ({
  open,
  onClose,
  onConfirm,
  timesheetCount,
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (reason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters long');
      return;
    }
    onConfirm(reason);
    setReason('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReason(e.target.value);
    if (e.target.value.trim().length >= 10) {
      setError('');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Reject Timesheet{timesheetCount > 1 ? 's' : ''}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are about to reject {timesheetCount} timesheet{timesheetCount > 1 ? 's' : ''}.
            Please provide a reason for rejection.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            placeholder="Enter the reason for rejecting this timesheet (minimum 10 characters)"
            value={reason}
            onChange={handleReasonChange}
            error={!!error}
            helperText={error || `${reason.length} characters`}
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={reason.trim().length < 10}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonDialog;