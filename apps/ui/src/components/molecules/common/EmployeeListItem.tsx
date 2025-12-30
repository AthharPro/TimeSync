import React from 'react';
import {
  ListItem,
  ListItemIcon,
  Checkbox,
  Box,
  Typography,
} from '@mui/material';
import type { IEmployeeListItemProps } from '../../../interfaces/common/IProjectTeam';
import { useTheme } from '@mui/material/styles';

const EmployeeListItem: React.FC<IEmployeeListItemProps> = ({
  employee,
  isSelected,
  onToggle,
}) => {
  const theme = useTheme();
  const displayName =
    employee.name ||
    [employee.firstName, employee.lastName].filter(Boolean).join(' ').trim() ||
    employee.email ||
    'Unknown User';
  const handleToggle = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onToggle(employee);
  };
  return (
    <ListItem
      component="button"
      onClick={() => onToggle(employee)}
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
    </ListItem>
  );
};

export default EmployeeListItem;
