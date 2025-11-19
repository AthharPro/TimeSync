import React from 'react';
import Box from '@mui/material/Box';
import FeatureCard from './FeatureCard';
import { useTheme } from '@mui/material/styles';
import {  IScrollingCardsProps } from '../../../interfaces/landing';

const ScrollingCard: React.FC<IScrollingCardsProps> = ({ 
  items, 
  animationDuration = 30 
}) => {
  
  const duplicatedItems = [...items, ...items];
  const theme = useTheme();
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden',bgcolor:theme.palette.background.default }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          maxHeight: 300,
          minHeight: 250,
          py: 2,
          width: 'max-content',
          animation: `scroll-left ${animationDuration}s linear infinite`,
          '@keyframes scroll-left': {
            '0%': { transform: 'translateX(0)' },
            '100%': { transform: 'translateX(-50%)' },
          },
          '&:hover': { animationPlayState: 'paused' },
        }}
      >
        {duplicatedItems.map((item, index) => (
          <FeatureCard
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ScrollingCard;