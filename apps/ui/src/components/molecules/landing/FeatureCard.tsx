import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import AppIcon from '../../atoms/landing/AppIcon';
import { IFeatureCardProps } from '../../../interfaces/landing';

const FeatureCard: React.FC<IFeatureCardProps> = ({ icon, title, description }) => {
  const theme = useTheme();

  const Icon = icon;

  return (
    <Card
      sx={{
        minWidth: 280,
        maxWidth: 320,
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.1s',
        boxShadow: theme.shadows[2],
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <AppIcon icon={Icon} size={40} marginBottom={2} />
        <Typography
          variant="h6"
          component="h3"
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          {title}
        </Typography>
        <Typography variant="body2"sx={{ color: theme.palette.text.secondary }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;