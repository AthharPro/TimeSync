import { Box, Typography } from '@mui/material';
import { ILoginLeftPanelProps } from '../../../interfaces/auth';
import { useTheme } from '@mui/material/styles';

const LoginLeftPanel: React.FC<ILoginLeftPanelProps> = ({
  icon,
  title,
  description,
  imageSrc,
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 4,
      }}
    >
      {/* Top Half - Content aligned to bottom */}
      <Box
        sx={{
          height: '50vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          textAlign: 'center',
          paddingBottom: 2,
        }}
      >
        {/* Logo */}
        {icon && (
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <img src={icon} alt="Logo" style={{ width: 70, height: 70 }} />
          </Box>
        )}

        {/* Title */}
        {title && (
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
        )}

        {/* Description */}
        {description && (
          <Typography
            variant="body1"
            component="p"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: { xs: '0.9rem', md: '1rem' },
              lineHeight: 1.5,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Bottom Half - Image aligned to bottom */}
      <Box
        sx={{
          height: '50vh',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingBottom: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 400,
            height: 250,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
            alt="Login Background"
            src={imageSrc}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginLeftPanel;
