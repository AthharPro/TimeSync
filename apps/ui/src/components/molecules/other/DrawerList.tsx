import List from '@mui/material/List';
import CustomListItemButton from '../../atoms/other/button/ListItemBtn';
import CustomListItemIcon from '../../atoms/other/Icon/ListItemIcon';
import CustomListItemText from '../../atoms/other/text/ListItemText';
import { ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IDrawerListProps } from '../../../interfaces/component';
import INavItemProps from '../../../interfaces/navigation/INavItemProps';

export default function DrawerList({ items }: IDrawerListProps) {
  const theme = useTheme();

  return items.map((group: INavItemProps[], groupIndex: number) => (
    <List key={`group-${groupIndex}`}>
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
  ));
}