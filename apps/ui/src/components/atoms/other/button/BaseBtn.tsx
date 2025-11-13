import { Button,Box } from '@mui/material';
import { IBaseBtnProps } from '../../../../interfaces/component';

const BaseBtn: React.FC<IBaseBtnProps> = ({
  children,
  variant = 'contained',
  fullWidth = false, 
  ...props
}) => {
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
    <Button
      variant={variant}
      fullWidth={fullWidth}
      sx={{
        textTransform: 'none',

        }}
        {...props}
      >
        {children}
      </Button>
    </Box>
  );
};

export default BaseBtn;

