import React, { useState } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { ISelectedEmployeeChipsProps } from '../../../interfaces/common/IProjectTeam';
import { useTheme } from '@mui/material/styles';
import ConformationDailog from '../other/ConformationDailog';
import EmployeeAllocationDialog from './EmployeeAllocationDialog';

const SelectedEmployeeChips: React.FC<ISelectedEmployeeChipsProps> = ({
  employees,
  onRemove,
  title,
  sx,
  onAllocationChange,
}) => {
  const theme = useTheme();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allocDialogOpen, setAllocDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any | null>(null);

  const handleDeleteClick = (employeeId: string) => {
    setPendingDeleteId(employeeId);
    setIsDialogOpen(true);
  };

  const handleChipClick = (employee: any) => {
    setCurrentEmployee(employee);
    setAllocDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPendingDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      onRemove(pendingDeleteId);
    }
    handleCloseDialog();
  };

  if (employees.length === 0) return null;

  return (
    <Box sx={sx}>
      {title && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 2,
          }}
        >
          {title} ({employees.length})
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
        }}
      >
        {employees.map((employee) => {
          const employeeId = employee._id || employee.id;
          const displayName =
            employee.name ||
            [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim() ||
            employee.email;

          // Determine allocation from possible shapes:
          // - employee.allocation (frontend selection)
          // - employee.allocation on populated/legacy shapes
          // - employee.user?.allocation when server returns subdocument where allocation is on parent
          const rawAlloc = (employee as any).allocation ?? (employee as any).user?.allocation ?? (employee as any).user?.allocation;
          const allocation = typeof rawAlloc !== 'undefined' && rawAlloc !== null ? Number(rawAlloc) : undefined;
          const hasAllocation = typeof allocation === 'number' && !Number.isNaN(allocation);

          return (
            <Chip
              key={employeeId}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontSize: '0.75rem',
                    }}
                  >
                    {displayName}
                  </Typography>

                  {employee.designation && (
                    <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.25,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.7rem',
                            fontWeight: 500,
                          }}
                        >
                          {employee.designation}
                        </Typography>
                      </Box>
                  )}
                  {/* Show allocation if present */}
                  <Box sx={{ ml: 1 }}>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                      {hasAllocation ? `${allocation}%` : '0%'}
                    </Typography>
                  </Box>
                </Box>
              }
              onClick={() => handleChipClick(employee)}
              onDelete={() => handleDeleteClick(employeeId)}
              deleteIcon={<CloseIcon sx={{ fontSize: 18 }} />}
              variant="outlined"
              size="medium"
              sx={{
                borderColor: theme.palette.text.secondary,
                backgroundColor: 'rgba(1, 50, 130, 0.05)',
                color: theme.palette.text.primary,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(1, 50, 130, 0.1)',
                  borderColor: theme.palette.primary.main,
                },
                '& .MuiChip-deleteIcon': {
                  color: theme.palette.text.secondary,
                  fontSize: 18,
                  '&:hover': {
                    color: theme.palette.error.main,
                    backgroundColor: theme.palette.action.hover,
                  },
                },
                transition: 'all 0.2s ease-in-out',
              }}
            />
          );
        })}
      </Box>
      <EmployeeAllocationDialog
        open={allocDialogOpen}
        employee={currentEmployee}
        onClose={() => { setAllocDialogOpen(false); setCurrentEmployee(null); }}
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
      <ConformationDailog
        open={isDialogOpen}
        message="Are you sure you want to delete this employee?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDialog}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default SelectedEmployeeChips;
