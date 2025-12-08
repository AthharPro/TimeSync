import List from '@mui/material/List';
import CustomListItemButton from '../../atoms/other/button/ListItemBtn';
import CustomListItemIcon from '../../atoms/other/Icon/ListItemIcon';
import CustomListItemText from '../../atoms/other/text/ListItemText';
import { ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IDrawerListProps } from '../../../interfaces/component';
import INavItemProps from '../../../interfaces/navigation/INavItemProps';
import { useWindowNavigation } from '../../../hooks/useWindowNavigation';

export default function DrawerList({ items }: IDrawerListProps) {
  const theme = useTheme();
  const { selectedButton, setSelectedButton } = useWindowNavigation();

  return items.map((group: INavItemProps[], groupIndex: number) => (
    <List key={`group-${groupIndex}`}>
      {group.map((item: INavItemProps, index: number) => {
        const buttonId = `item-${groupIndex}-${index}`;

        return (
          <ListItem key={buttonId} disablePadding sx={{ paddingY: 1 }}>
            <CustomListItemButton
              onClick={() => setSelectedButton(item.text)}
              sx={{
                '&:hover': { backgroundColor: theme.palette.secondary.dark,color: theme.palette.text.secondary },
                      color: theme.palette.text.secondary,
                backgroundColor: selectedButton === item.text ? theme.palette.primary.light : 'transparent',
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