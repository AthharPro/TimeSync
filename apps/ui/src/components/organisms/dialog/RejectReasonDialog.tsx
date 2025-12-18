import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
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

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }

    onConfirm(reason.trim());
    handleClose();
  };

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReason(event.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Reject {timesheetCount} Timesheet{timesheetCount > 1 ? 's' : ''}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            placeholder="Please provide a reason for rejecting these timesheets..."
            value={reason}
            onChange={handleReasonChange}
            error={!!error}
            helperText={error || `${reason.length} characters (minimum 10 required)`}
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!reason.trim() || reason.trim().length < 10}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectReasonDialog;
