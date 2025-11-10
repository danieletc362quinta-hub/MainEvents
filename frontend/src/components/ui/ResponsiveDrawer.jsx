import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  useTheme, 
  useMediaQuery 
} from '@mui/material';

const ResponsiveDrawer = ({ 
  open, 
  onClose, 
  children,
  width = 240,
  variant = 'temporary',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Drawer
      variant={isMobile ? 'temporary' : variant}
      open={open}
      onClose={onClose}
      sx={{
        width: isMobile ? '100%' : width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : width,
          boxSizing: 'border-box',
          [theme.breakpoints.down('sm')]: {
            paddingTop: theme.spacing(8), // Espacio para el AppBar
          }
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Drawer>
  );
};

export const DrawerItem = ({ 
  icon, 
  text, 
  onClick, 
  selected = false,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ListItem
      button
      onClick={onClick}
      selected={selected}
      sx={{
        [theme.breakpoints.down('sm')]: {
          minHeight: 48,
          padding: theme.spacing(1, 2),
        },
        '&.Mui-selected': {
          backgroundColor: theme.palette.primary.main + '20',
          '&:hover': {
            backgroundColor: theme.palette.primary.main + '30',
          }
        }
      }}
      {...props}
    >
      {icon && (
        <ListItemIcon
          sx={{
            minWidth: isMobile ? 40 : 56,
            color: selected ? theme.palette.primary.main : 'inherit'
          }}
        >
          {icon}
        </ListItemIcon>
      )}
      <ListItemText 
        primary={text}
        sx={{
          '& .MuiListItemText-primary': {
            fontSize: isMobile ? '0.875rem' : '1rem',
            fontWeight: selected ? 600 : 400
          }
        }}
      />
    </ListItem>
  );
};

export const DrawerDivider = () => {
  return <Divider sx={{ my: 1 }} />;
};

export default ResponsiveDrawer;
