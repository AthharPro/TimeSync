import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IConfirmDialogProps } from '../../../interfaces/other/IConformationDailog';

export default function ConformationDailog({
  open,
  title = 'Confirm',
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  icon,
  confirmButtonColor = 'primary',
  onConfirm,
  onCancel,
  onClose,
}: IConfirmDialogProps) {
  const theme = useTheme();
  const handleClose = onClose || onCancel;
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 3,
          backgroundColor: theme.palette.background.default,
          minWidth: 200,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 3 }}>
        {icon && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                color: theme.palette.primary.main,
                fontSize: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
              }}
            >
              {icon}
            </Box>
          </Box>
        )}
        <Typography
          variant="h5"
          component="span"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
        <Typography
          variant="body1"
          sx={{ lineHeight: 1.6, color: theme.palette.text.secondary }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          size="large"
          sx={{
            minWidth: 100,
            height: 44,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: theme.palette.secondary.main,
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.primary.main,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="large"
          sx={{
            minWidth: 100,
            height: 44,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.background.default,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark || '#001f5c',
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
