import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  useTheme,
  useMediaQuery,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Fade,
  Slide
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';
import LanguageSelector from './LanguageSelector';
import EnhancedButton from './EnhancedButton';

/**
 * Navegación responsive mejorada con animaciones y mejor UX
 */
const ResponsiveNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Detectar scroll para cambiar apariencia
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Items de navegación
  const navigationItems = [
    { label: t('nav.home'), path: '/', icon: <HomeIcon /> },
    { label: t('nav.events'), path: '/events', icon: <EventIcon /> },
    { label: t('nav.suppliers'), path: '/suppliers', icon: <PersonIcon /> },
  ];

  // Items del menú de usuario
  const userMenuItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: <DashboardIcon /> },
    { label: t('nav.profile'), path: '/profile', icon: <PersonIcon /> },
    { label: t('nav.settings'), path: '/settings', icon: <SettingsIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Componente del drawer móvil
  const MobileDrawer = () => (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Mejor rendimiento en móvil
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            MainEvents
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <ListItem
                button
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: isActivePath(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      fontWeight: isActivePath(item.path) ? 600 : 400 
                    } 
                  }}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>

        <Divider sx={{ my: 2, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <LanguageSelector variant="button" size="small" />
          
          {user ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                  {user.name?.charAt(0)}
                </Avatar>
                <Typography variant="body2">
                  {user.name}
                </Typography>
              </Box>
              
              <List sx={{ p: 0 }}>
                {userMenuItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + navigationItems.length) * 0.1, duration: 0.3 }}
                  >
                    <ListItem
                      button
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        backgroundColor: isActivePath(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            fontWeight: isActivePath(item.path) ? 600 : 400 
                          } 
                        }}
                      />
                    </ListItem>
                  </motion.div>
                ))}
              </List>
              
              <EnhancedButton
                variant="error"
                size="small"
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                {t('nav.logout')}
              </EnhancedButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <EnhancedButton
                variant="primary"
                size="small"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={() => handleNavigation('/login')}
              >
                {t('nav.login')}
              </EnhancedButton>
              <EnhancedButton
                variant="secondary"
                size="small"
                fullWidth
                startIcon={<AccountCircleIcon />}
                onClick={() => handleNavigation('/register')}
              >
                {t('nav.register')}
              </EnhancedButton>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: scrolled 
            ? 'rgba(102, 126, 234, 0.95)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? theme.shadows[4] : 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Toolbar>
          {/* Logo y título */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: 'linear-gradient(45deg, #fff 0%, #f0f0f0 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                onClick={() => navigate('/')}
              >
                MainEvents
              </Typography>
            </motion.div>
          </Box>

          {/* Navegación desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    fontWeight: isActivePath(item.path) ? 600 : 400,
                    backgroundColor: isActivePath(item.path) ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Controles de usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <LanguageSelector variant="icon" size="small" />
            
            {user ? (
              <>
                <IconButton color="inherit">
                  <Badge badgeContent={0} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
                
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{ ml: 1 }}
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.name?.charAt(0)}
                  </Avatar>
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  TransitionComponent={Fade}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      mt: 1,
                    },
                  }}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      onClick={() => {
                        handleNavigation(item.path);
                        handleUserMenuClose();
                      }}
                      sx={{
                        py: 1.5,
                        px: 2,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      py: 1.5,
                      px: 2,
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: theme.palette.error.light,
                        color: 'white',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                      <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('nav.logout')} />
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <EnhancedButton
                  variant="primary"
                  size="small"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                >
                  {t('nav.login')}
                </EnhancedButton>
                <EnhancedButton
                  variant="secondary"
                  size="small"
                  startIcon={<AccountCircleIcon />}
                  onClick={() => navigate('/register')}
                >
                  {t('nav.register')}
                </EnhancedButton>
              </Box>
            )}

            {/* Botón de menú móvil */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ ml: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <MobileDrawer />

      {/* Espaciador para el contenido */}
      <Toolbar />
    </>
  );
};

export default ResponsiveNavigation;




