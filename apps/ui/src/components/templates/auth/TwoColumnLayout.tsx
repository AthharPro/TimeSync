import { Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ITwoColumnLayoutProps } from '../../../interfaces/auth';

const TwoColumnLayout: React.FC<ITwoColumnLayoutProps> = ({
  leftContent,
  rightContent,
}) => {
  const theme = useTheme();
  return (
    <Grid container sx={{ height: '100vh', overflow: 'hidden' }}>
      {/* left side section */}
      <Grid
        size={6}
        sx={{
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        {leftContent}
      </Grid>
      {/* right side section */}
      <Grid
        size={6}
        sx={{
          backgroundColor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        {rightContent}
      </Grid>
    </Grid>
  );
};

export default TwoColumnLayout;
