import React from 'react';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { ISectionTitleProps } from '../../../interfaces/landing';

const SectionTitle: React.FC<ISectionTitleProps> = ({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <>
      <Typography
        variant="h3"
        component="h2"
        sx={{ fontWeight: 'bold', mb: 2}}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="h6"
          sx={{ maxWidth: 600, mx: 'auto' ,color: theme.palette.text.secondary}}
        >
          {subtitle}
        </Typography>
      )}
    </>
  );
};

export default SectionTitle;