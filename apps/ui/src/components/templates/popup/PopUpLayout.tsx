import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IPopupLayoutProps } from '../../../interfaces/popup/IPopupLayout';

const PopUpLayout: React.FC<IPopupLayoutProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  size = 'md',
  showCloseButton = true,
  actions,
}) => {
  // Define width based on size prop
  const getWidth = () => {
    switch (size) {
      case 'sm':
        return '400px';
      case 'md':
        return '680px';
      case 'lg':
        return '900px';
      case 'xl':
        return '1200px';
      default:
        return '680px';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '300px',
          width: getWidth(),
          backgroundColor: (theme) => theme.palette.background.default,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <DialogContent 
        dividers 
        sx={{ 
          py: 3,
          maxHeight: '70vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        {children}
      </DialogContent>
      {actions && <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions>}
    </Dialog>
  );
};

export default PopUpLayout;
