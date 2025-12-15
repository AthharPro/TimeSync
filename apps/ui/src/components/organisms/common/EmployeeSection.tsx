import React from 'react';
import { Box, Typography, Chip, Button, Avatar, Paper } from '@mui/material';
import { IconButton } from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { IEmployeeSectionProps } from '../../../interfaces/common/IProjectTeam';
import BaseBtn from '../../atoms/other/button/BaseBtn';

const EmployeeSection: React.FC<IEmployeeSectionProps> = ({
  selectedEmployees,
  onAddEmployeesClick,
  onRemoveEmployee,
  title = 'Employees',
  emptyMessage = 'No employees assigned yet',
  height = 'auto',
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {title}
          </Typography>
          {selectedEmployees.length > 0 && (
            <Chip
              label={`${selectedEmployees.length} assigned`}
              size="small"
              sx={{
                backgroundColor: theme.palette.text.secondary,
                color: theme.palette.background.default,
                fontWeight: 500,
                fontSize: '0.75rem',
                height: '20px',
              }}
            />
          )}
        </Box>

        <BaseBtn
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddEmployeesClick}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default,
            borderRadius: 2,
          }}
        >
          {selectedEmployees.length === 0 ? 'Add Employees' : 'Manage Team'}
        </BaseBtn>
      </Box>

      <Paper
        elevation={0}
        sx={{
          border:
            selectedEmployees.length > 0
              ? `2px solid ${theme.palette.text.secondary}`
              : `2px dashed ${theme.palette.text.secondary}`,
          backgroundColor: theme.palette.background.default,
          minHeight: height === 'auto' ? '120px' : height,
          overflow: 'hidden',
        }}
      >
        {selectedEmployees.length > 0 ? (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {selectedEmployees.map((employee) => (
                <Paper
                  key={employee.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    position: 'relative',
                    backgroundColor: theme.palette.background.default,
                    border: `2px solid ${theme.palette.secondary.main}`,
                    borderRadius: 3,
                    '&:hover': {
                      borderColor: theme.palette.text.secondary,
                      backgroundColor: theme.palette.background.paper,
                    },
                  }}
                >
                  <IconButton
                    aria-label="remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveEmployee(employee.id);
                    }}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.error.main,
                      },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {employee.name}
                      </Typography>

                      {employee.designation && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {employee.designation}
                          </Typography>
                        </Box>
                      )}

                      {employee.email && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.7rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {employee.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
              px: 2,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(1, 50, 130, 0.05)',
              },
            }}
            onClick={onAddEmployeesClick}
          >
            <Avatar
              sx={{
                backgroundColor: theme.palette.text.secondary,
                color: theme.palette.background.default,
                width: 60,
                height: 60,
                mb: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 30 }} />
            </Avatar>

            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.primary,
                fontWeight: 600,
                mb: 1,
              }}
            >
              Build The Team
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: 300,
                lineHeight: 1.5,
                mb: 2,
              }}
            >
              {emptyMessage}. Click here to start adding team members.
            </Typography>

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: 'rgba(1, 50, 130, 0.05)',
                },
              }}
            >
              Add First Employee
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeSection;


