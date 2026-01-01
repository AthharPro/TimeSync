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
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import { IPopupLayoutProps } from '../../../interfaces/popup/IPopupLayout';

const PopUpLayout: React.FC<IPopupLayoutProps> = ({
  open,
  onClose,
  onBack,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  showCloseButton = true,
  actions,
  paperHeight,
}) => {
  // Calculate fixed width based on maxWidth prop to prevent resizing
  const getWidthStyles = () => {
    if (maxWidth === 'xl') {
      return { width: '1140px', minWidth: '1140px', maxWidth: '1140px' };
    }else if (maxWidth === 'lg') {
      return { width: '900px', minWidth: '900px', maxWidth: '900px' };
    } else if (maxWidth === 'xs') {
      return { width: '444px', minWidth: '444px', maxWidth: '444px' };
    } else {
      return { width: '680px', minWidth: '680px', maxWidth: '680px' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={maxWidth === 'lg' || maxWidth === 'xl'}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '300px',
          height: paperHeight,
          display: 'flex',
          flexDirection: 'column',
          ...getWidthStyles(),
          backgroundColor: (theme) => theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={1}>
            {onBack && (
              <IconButton
                aria-label="back"
                onClick={onBack}
                sx={{
                  color: (theme) => theme.palette.text.primary,
                }}
              >
                <ArrowBackIosNewRoundedIcon fontSize="small" />
              </IconButton>
            )}
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
          flex: 1,
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
