import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IEmployee } from '../../../interfaces/user/IUser';

interface Props {
  open: boolean;
  employee?: IEmployee | null;
  onClose: () => void;
  onConfirm: (allocation: number) => void;
}

export default function EmployeeAllocationDialog({ open, employee, onClose, onConfirm }: Props) {
  const theme = useTheme();
  const [allocation, setAllocation] = useState<number>(employee?.allocation ?? 0);

  useEffect(() => {
    setAllocation(employee?.allocation ?? 0);
  }, [employee]);

  if (!employee) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: 'center' }}>Set Allocation</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">{employee.name || employee.email}</Typography>
          <Typography variant="body2" color="text.secondary">{employee.email}</Typography>
          {employee.designation && (
            <Typography variant="body2" color="text.secondary">{employee.designation}</Typography>
          )}
        </Box>
        <TextField
          label="Allocation (%)"
          type="number"
          fullWidth
          inputProps={{ min: 0, max: 100 }}
          value={allocation}
          onChange={(e) => setAllocation(Math.max(0, Math.min(100, Number(e.target.value || 0))))}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={() => onConfirm(allocation)} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
