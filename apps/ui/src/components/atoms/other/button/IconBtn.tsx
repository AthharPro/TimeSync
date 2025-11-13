import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { ReactNode } from 'react';

export default function CustomIconButton(props: IconButtonProps & { children?: ReactNode }) {
  return <IconButton {...props}>{props.children}</IconButton>;
}
