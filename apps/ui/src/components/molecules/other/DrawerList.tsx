import React from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CustomListItemButton from '../../atoms/other/button/ListItemBtn';
import CustomListItemIcon from '../../atoms/other/Icon/ListItemIcon';
import CustomListItemText from '../../atoms/other/text/ListItemText';
import { ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IDrawerListProps } from '../../../interfaces/component';
import INavItemProps from '../../../interfaces/navigation/INavItemProps';

export default function DrawerList({ items }: IDrawerListProps) {
  const theme = useTheme();

  return (
    <>
      {items.map((group: INavItemProps[], groupIndex: number) => (
        <div key={`group-${groupIndex}`}>
          <List>
            {group.map((item: INavItemProps, index: number) => {
              const buttonId = `item-${groupIndex}-${index}`;

              return (
                <ListItem key={buttonId} disablePadding sx={{ paddingY: 1 }}>
                  <CustomListItemButton
                    sx={{
                      '&:hover': { backgroundColor: theme.palette.primary.light,color: theme.palette.secondary.light },
                      color: theme.palette.secondary.dark,
                    }}
                  >
                    <CustomListItemIcon>{item.icon}</CustomListItemIcon>
                    <CustomListItemText primary={item.text} />
                  </CustomListItemButton>
                </ListItem>
              );
            })}
          </List>
          {groupIndex < items.length - 1 && <Divider sx={{backgroundColor:theme.palette.secondary.dark,marginX:1}}/>} 
        </div>
      ))}
    </>
  );
}