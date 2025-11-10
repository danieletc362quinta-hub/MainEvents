import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Box,
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

const ResponsiveAppBar = ({ 
  title, 
  onMenuClick,
  children,
  position = 'fixed',
  elevation = 1,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar
      position={position}
      elevation={elevation}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        [theme.breakpoints.down('sm')]: {
          '& .MuiToolbar-root': {
            minHeight: 56,
            padding: theme.spacing(0, 1),
          }
        }
      }}
      {...props}
    >
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            edge="start"
            sx={{
              mr: 2,
              [theme.breakpoints.down('sm')]: {
                mr: 1,
                padding: theme.spacing(0.5),
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 600,
            [theme.breakpoints.down('sm')]: {
              fontSize: '1.1rem',
            }
          }}
        >
          {title}
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            [theme.breakpoints.down('sm')]: {
              gap: 0.5,
            }
          }}
        >
          {children}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default ResponsiveAppBar;
