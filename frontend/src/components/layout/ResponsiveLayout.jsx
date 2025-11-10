import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ResponsiveAppBar from '../ui/ResponsiveAppBar';
import ResponsiveDrawer, { DrawerItem } from '../ui/ResponsiveDrawer';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import LanguageSelector from '../ui/LanguageSelector';

const ResponsiveLayout = ({ 
  children, 
  title = 'MainEvents',
  drawerItems = [],
  onDrawerItemClick,
  selectedDrawerItem
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const { t } = useLanguage();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerItemClick = (item) => {
    if (onDrawerItemClick) {
      onDrawerItemClick(item);
    }
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <ResponsiveAppBar
        title={title}
        onMenuClick={handleDrawerToggle}
        position="fixed"
        elevation={1}
      >
        <LanguageSelector variant="chip" size="small" />
      </ResponsiveAppBar>

      {drawerItems.length > 0 && (
        <ResponsiveDrawer
          open={drawerOpen}
          onClose={handleDrawerToggle}
          variant={isMobile ? 'temporary' : 'persistent'}
          width={240}
        >
          <Box sx={{ overflow: 'auto', mt: 8 }}>
            {drawerItems.map((item, index) => (
              <DrawerItem
                key={index}
                icon={item.icon}
                text={item.text}
                selected={selectedDrawerItem === item.key}
                onClick={() => handleDrawerItemClick(item)}
              />
            ))}
          </Box>
        </ResponsiveDrawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? 240 : 0}px)` },
          ml: { sm: drawerOpen ? 0 : 0 },
          mt: 8, // Altura del AppBar
          [theme.breakpoints.down('sm')]: {
            p: 2,
            mt: 7,
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ResponsiveLayout;
