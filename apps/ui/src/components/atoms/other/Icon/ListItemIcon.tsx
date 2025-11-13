import React from 'react';
import { ListItemIcon as MuiListItemIcon } from '@mui/material';
import { IListItemIconProps } from '../../../../interfaces/component';

const ListItemIcon: React.FC<IListItemIconProps> = ({ children }) => {
  return (
    <MuiListItemIcon
      sx={[
        {
          color: 'inherit',
          minWidth: 0,
          justifyContent: 'center',
        },
        {
          mr: 3,
        },
      ]}
    >
      {children}
    </MuiListItemIcon>
  );
};

export default ListItemIcon;
