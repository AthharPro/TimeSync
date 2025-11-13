import IconButton from '@mui/material/IconButton';

export default function CustomIconButton(props: any) {
  return <IconButton {...props}>{props.children}</IconButton>;
}
