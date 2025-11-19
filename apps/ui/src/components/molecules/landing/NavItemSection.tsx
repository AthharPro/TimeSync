import React from 'react';
import Box from '@mui/material/Box';
import BaseButton from '../../atoms/other/button/BaseBtn';
import { INavItemSectionProps } from '../../../interfaces/landing';

const NavItemSection: React.FC<INavItemSectionProps> = ({
  items,
  onNavigate,
  display = { xs: 'none', sm: 'block' },
  direction = 'row',
  alignItems = 'center',
}) => {
  return (
    <Box
      sx={{
        display,
        flexDirection: direction,
        alignItems,
      }}
    >
      {items.map((item) => (
        <BaseButton
          variant="text"
          key={item.target}
          onClick={() => onNavigate(item.target)}
          sx={{
            mx: direction === 'row' ? 0.5 : 0,
            my: direction === 'column' ? 0.5 : 0,
            width: direction === 'column' ? '100%' : 'auto',
            justifyContent: 'flex-start',
          }}
        >
          {item.label}
        </BaseButton>
      ))}
    </Box>
  );
};

export default NavItemSection;