import { Box, CircularProgress } from '@mui/material';
import { ILoadingSpinnerProps } from '../../../../interfaces/component';

const LoadingSpinner: React.FC<ILoadingSpinnerProps> = ({ 
  size = 40, 
  message 
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress size={size} />
      {message && (
        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
          {message}
        </Box>
      )}
    </Box>
  );
};

export default LoadingSpinner;


