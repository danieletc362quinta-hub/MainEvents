import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Search as SearchIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Favorite as FavoriteIcon,
  Payment as PaymentIcon,
  LocalOffer as CouponIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationSystem from '../ui/NotificationSystem';
import DebugPanel from '../ui/DebugPanel';

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const menuItems = [
    { text: 'Inicio', icon: <HomeIcon />, path: '/' },
    { text: 'Eventos', icon: <EventIcon />, path: '/events' },
    { text: 'Crear Evento', icon: <AddIcon />, path: '/create-event', protected: true },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', protected: true },
    { text: 'Perfil', icon: <PersonIcon />, path: '/profile', protected: true },
    { text: 'Pagos', icon: <PaymentIcon />, path: '/payments', protected: true },
    { text: 'Cupones', icon: <CouponIcon />, path: '/coupons', protected: true },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.protected || (item.protected && user)
  );

  const drawer = (
    <Box sx={{ width: 280, height: '100%' }}>
      {/* Logo y título */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          },
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <EventIcon sx={{ fontSize: 48, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            MainEvents
          </Typography>
        </motion.div>
      </Box>

      {/* Menú de navegación */}
      <List sx={{ p: 2 }}>
        {filteredMenuItems.map((item, index) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ListItem
              button
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                background: location.pathname === item.path 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                  : 'transparent',
                border: location.pathname === item.path 
                  ? '1px solid rgba(99, 102, 241, 0.2)'
                  : '1px solid transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  transform: 'translateX(5px)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? theme.palette.primary.main : 'text.secondary',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    color: location.pathname === item.path ? theme.palette.primary.main : 'text.primary',
                  },
                }}
              />
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: 'absolute',
                    right: 8,
                    width: 4,
                    height: 20,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    borderRadius: 2,
                  }}
                />
              )}
            </ListItem>
          </motion.div>
        ))}
      </List>

      {/* Información del usuario */}
      {user && (
        <>
          <Divider sx={{ mx: 2, mb: 2 }} />
          <Box sx={{ p: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mr: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {user.name}
                  </Typography>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              </Box>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    borderColor: theme.palette.error.dark,
                    background: 'rgba(239, 68, 68, 0.04)',
                  },
                }}
              >
                Cerrar Sesión
              </Button>
            </motion.div>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon sx={{ color: theme.palette.text.primary }} />
          </IconButton>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                mr: 4,
              }}
              onClick={() => navigate('/')}
            >
              <EventIcon
                sx={{
                  fontSize: 32,
                  mr: 1,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                MainEvents
              </Typography>
            </Box>
          </motion.div>

          {/* Navegación desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {filteredMenuItems.map((item, index) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Button
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    mx: 1,
                    color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.08)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              </motion.div>
            ))}
          </Box>

          {/* Acciones del usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                {/* Notificaciones */}
                <IconButton
                  color="inherit"
                  onClick={handleNotificationsOpen}
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.08)',
                    },
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>

                {/* Perfil */}
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.08)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5b5ee8 0%, #7c3aed 100%)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                    },
                  }}
                >
                  Iniciar Sesión
                </Button>
              </motion.div>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }}
      >
        <Toolbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </Box>

      {/* Menú de perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
          },
        }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          Dashboard
        </MenuItem>
        <MenuItem onClick={() => { navigate('/notifications'); handleMenuClose(); }}>
          <ListItemIcon>
            <NotificationsIcon fontSize="small" />
          </ListItemIcon>
          Notificaciones
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Menú de notificaciones */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            width: 320,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notificaciones
          </Typography>
        </Box>
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Nuevo evento disponible
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Se ha publicado un nuevo evento que te puede interesar
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Recordatorio de evento
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tu evento "Concierto de Rock" comienza en 2 horas
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Pago confirmado
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tu pago ha sido procesado exitosamente
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout; 
