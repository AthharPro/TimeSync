import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { ISelectedEmployeeChipsProps } from '../../../interfaces/common/IProjectTeam';
import { useTheme } from '@mui/material/styles';

const SelectedEmployeeChips: React.FC<ISelectedEmployeeChipsProps> = ({
  employees,
  onRemove,
  title,
  sx,
}) => {
  const theme = useTheme();

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
        {employees.map((employee) => (
            <Chip
              key={employee.id}
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
                    {employee.name}
                  </Typography>

                  {employee.designation && (
                    <>
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
                    </>
                  )}
                </Box>
              }
              onDelete={() => onRemove(employee.id)}
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
          
        ))}
      </Box>
    </Box>
  );
};

export default SelectedEmployeeChips;
