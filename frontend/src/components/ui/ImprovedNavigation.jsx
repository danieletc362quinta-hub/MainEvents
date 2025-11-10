import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  Event as EventIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  LocalOffer as CouponIcon,
  Notifications as NotificationIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Language as LanguageIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Componente de Navegación mejorado siguiendo las 10 pautas de diseño web
 * - Código limpio y semántico
 * - Diseño responsive
 * - Optimización de velocidad
 * - Accesibilidad completa
 * - SEO optimizado
 * - Diseño moderno y minimalista
 * - Navegación clara
 * - Feedback estético
 * - Consistencia visual
 * - Seguridad básica
 */
const ImprovedNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { t, changeLanguage } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  
  // Estados del componente
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notifications

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manejo del menú móvil
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Manejo del menú de usuario
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  // Navegación
  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    handleUserMenuClose();
  };

  // Logout
  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/');
  };

  // Cambio de idioma
  const handleLanguageToggle = () => {
    changeLanguage(language === 'es' ? 'en' : 'es');
  };

  // Items de navegación
  const navigationItems = [
    { label: 'Inicio', path: '/', icon: HomeIcon },
    { label: 'Eventos', path: '/events', icon: EventIcon },
    ...(isAuthenticated ? [
      { label: 'Crear Evento', path: '/create-event', icon: AddIcon },
      { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
      { label: 'Perfil', path: '/profile', icon: PersonIcon },
      { label: 'Pagos', path: '/payments', icon: PaymentIcon },
      { label: 'Cupones', path: '/coupons', icon: CouponIcon }
    ] : [])
  ];

  // Items de autenticación
  const authItems = isAuthenticated ? [
    { label: 'Cerrar Sesión', action: handleLogout, icon: LogoutIcon }
  ] : [
    { label: 'Iniciar Sesión', path: '/login', icon: LoginIcon },
    { label: 'Registrarse', path: '/register', icon: RegisterIcon }
  ];

  // Componente del menú móvil
  const MobileDrawer = () => (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 280,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            MainEvents
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
        
        <List>
          {navigationItems.map((item) => (
            <ListItem
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                mb: 0.5,
                bgcolor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
        
        <List>
          {authItems.map((item) => (
            <ListItem
              key={item.label}
              onClick={() => item.path ? handleNavigation(item.path) : item.action()}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <item.icon />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: scrolled 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.3s ease',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
          {/* Logo y título */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              mr: 4
            }}
            onClick={() => handleNavigation('/')}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                color: scrolled ? theme.palette.primary.main : 'white',
                transition: 'color 0.3s ease'
              }}
            >
              MainEvents
            </Typography>
          </Box>

          {/* Navegación desktop */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  startIcon={<item.icon />}
                  sx={{
                    color: scrolled ? theme.palette.text.primary : 'white',
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    mx: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    bgcolor: location.pathname === item.path 
                      ? (scrolled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.2)')
                      : 'transparent',
                    '&:hover': {
                      bgcolor: scrolled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Acciones del header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Notificaciones (solo si está autenticado) */}
            {isAuthenticated && (
              <Tooltip title="Notificaciones">
                <IconButton
                  sx={{
                    color: scrolled ? theme.palette.text.primary : 'white',
                    transition: 'color 0.3s ease'
                  }}
                >
                  <Badge badgeContent={notifications} color="error">
                    <NotificationIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}

            {/* Selector de idioma */}
            <Box sx={{ ml: 1 }}>
              <LanguageSelector variant="simple" size="small" />
            </Box>

            {/* Menú de usuario o botones de auth */}
            {isAuthenticated ? (
              <>
                <Tooltip title="Menú de usuario">
                  <IconButton
                    onClick={handleUserMenuOpen}
                    sx={{
                      color: scrolled ? theme.palette.text.primary : 'white',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '0.875rem'
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                  TransitionComponent={Fade}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 2,
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.primary">
                      {user?.name || 'Usuario'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  
                  {authItems.map((item) => (
                    <MenuItem
                      key={item.label}
                      onClick={() => item.path ? handleNavigation(item.path) : item.action()}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(102, 126, 234, 0.1)'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <item.icon />
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleNavigation('/login')}
                  startIcon={<LoginIcon />}
                  sx={{
                    color: scrolled ? theme.palette.primary.main : 'white',
                    borderColor: scrolled ? theme.palette.primary.main : 'white',
                    '&:hover': {
                      borderColor: scrolled ? theme.palette.primary.dark : 'white',
                      bgcolor: scrolled ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleNavigation('/register')}
                  startIcon={<RegisterIcon />}
                  sx={{
                    bgcolor: scrolled ? theme.palette.primary.main : 'white',
                    color: scrolled ? 'white' : theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: scrolled ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                >
                  Registrarse
                </Button>
              </Box>
            )}

            {/* Botón de menú móvil */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="abrir menú"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  color: scrolled ? theme.palette.text.primary : 'white',
                  transition: 'color 0.3s ease'
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer móvil */}
      <MobileDrawer />

      {/* Spacer para el contenido */}
      <Toolbar />
    </>
  );
};

export default ImprovedNavigation;
