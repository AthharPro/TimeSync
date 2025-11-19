import React from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import AppIcon from '../../atoms/landing/AppIcon'
import Box from '@mui/material/Box'
import FeatureList from './FeatureList'
import { useTheme } from '@mui/material/styles';
import { RoleCardProps } from '../../../interfaces/landing';

const RoleCard: React.FC<RoleCardProps> = ({ icon, title, description, features }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        textAlign: 'center',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': { transform: 'translateY(-4px)' },
        bgcolor: theme.palette.background.default,
        width: { xs: '100%', sm: 320 },
        minHeight: { xs: 0, sm: 300 },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AppIcon icon={icon} size={30} marginBottom={3} />
      <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3,color: theme.palette.text.secondary }}>
        {description}
      </Typography>
      <Box >
        <FeatureList features={features} />
      </Box>
    </Paper>
  )
}

export default RoleCard


