import React, { useState } from 'react';
import {
  ListItem,
  ListItemIcon,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';
import type { IEmployeeListItemProps } from '../../../interfaces/common/IProjectTeam';
import { useTheme } from '@mui/material/styles';
import EmployeeAllocationDialog from './EmployeeAllocationDialog';

const EmployeeListItem: React.FC<IEmployeeListItemProps> = ({
  employee,
  isSelected,
  onToggle,
  onAllocationChange,
}) => {
  const theme = useTheme();
  const displayName =
    employee.name ||
    [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim() ||
    employee.email ||
    'Unknown User';

  const [allocDialogOpen, setAllocDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any | null>(null);

  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggle(employee);

    if (!isSelected || e === undefined) {
      setCurrentEmployee(employee);
      setAllocDialogOpen(true);
    }
  };

  const handleListItemClick = (e: React.MouseEvent) => {
  // If dialog is open, ignore any clicks bubbling from it
  if (allocDialogOpen) return;

  onToggle(employee);

  // Only open dialog when selecting
  if (!isSelected) {
    setCurrentEmployee(employee);
    setAllocDialogOpen(true);
  }
};

  return (
    <ListItem
      component="button"
      onClick={handleListItemClick}
      
      sx={{
        mb: 1,
        border: '2px solid',
        borderRadius: 3,
        borderColor: isSelected
          ? theme.palette.secondary.main
          : theme.palette.text.secondary,
        backgroundColor: isSelected
          ? 'rgba(1, 50, 130, 0.05)'
          : theme.palette.background.paper,
        p: 2,
        '&:hover': {
          backgroundColor: isSelected
            ? 'rgba(1, 50, 130, 0.08)'
            : theme.palette.background.default,
          borderColor: theme.palette.secondary.main,
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 48 }}>
        <Checkbox
          checked={isSelected}
          onClick={handleToggle}
          sx={{
            color: theme.palette.text.secondary,
          }}
        />
      </ListItemIcon>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        {/* Employee Information */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {displayName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: theme.palette.text.secondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {employee.email}
            </Typography>
          </Box>

          {employee.designation && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.text.secondary,

                  fontWeight: 500,
                }}
              >
                {employee.designation}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      <EmployeeAllocationDialog
        open={allocDialogOpen}
        employee={currentEmployee}
        onClose={() => {
          setAllocDialogOpen(false);
          setCurrentEmployee(null);
        }}
        onConfirm={(allocation) => {
          if (currentEmployee) {
            const id = currentEmployee._id || currentEmployee.id;
            if (typeof onAllocationChange === 'function') {
              onAllocationChange(id, allocation);
            }
            // update local selection display if the employee object is the same reference
            if (currentEmployee) {
              currentEmployee.allocation = allocation;
            }
          }
          setAllocDialogOpen(false);
          setCurrentEmployee(null);
        }}
      />
    </ListItem>
  );
};

export default EmployeeListItem;
