import styled from '@emotion/styled';
import { Grid, Paper, Box, Typography } from '@mui/material';
import { IAuthFormContainer } from '../../../interfaces/auth';
import theme from '../../../styles/theme';

const StylePaper = styled(Paper)(() => ({
  minHeight: 520,
  width: 460,
  maxWidth: 460,
  borderRadius: 16,
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
}));

const AuthFormLayout: React.FC<IAuthFormContainer> = ({
  icon,
  title,
  children,
  description,
}) => {
  return (
    <StylePaper>
      <Grid
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px 16px',
            
            bgcolor: theme.palette.background.default,
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            {icon &&
              (typeof icon === 'string' ? (
                <img
                  src={icon}
                  style={{ width: '60px', height: '60px' }}
                  alt="icon"
                />
              ) : (
                icon
              ))}
          </Box>
          {/* Title */}
          <Typography
            variant="h4"
            sx={{ mb: 2 }}
            textAlign="center"
          >
            {title}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 2 ,color: theme.palette.text.secondary}}
            textAlign="center"
          >
            {description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            {children}
          </Box>
        </Grid>
      </StylePaper>
    
  );
};

export default AuthFormLayout;