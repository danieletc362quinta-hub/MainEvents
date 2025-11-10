import React, { useState, useEffect, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  Tooltip,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsNone as NotificationsNoneIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Settings as SettingsIcon,
  ClearAll as ClearAllIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationSystem = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentSnackbar, setCurrentSnackbar] = useState(null);

  // Cargar notificaciones del localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter(n => !n.read).length);
    }
  }, []);

  // Guardar notificaciones en localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Agregar nueva notificación
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Mantener máximo 50
    setUnreadCount(prev => prev + 1);

    // Mostrar snackbar para notificaciones importantes
    if (notification.priority === 'high') {
      setCurrentSnackbar(newNotification);
    }
  }, []);

  // Marcar como leída
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Eliminar notificación
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      const newNotifications = prev.filter(n => n.id !== id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return newNotifications;
    });
  }, []);

  // Limpiar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Obtener icono según tipo
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  // Obtener color según tipo
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'error': return theme.palette.error.main;
      case 'info': return theme.palette.info.main;
      default: return theme.palette.primary.main;
    }
  };

  // Formatear tiempo relativo
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  // Componente de notificación individual
  const NotificationItem = ({ notification }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      <ListItem
        sx={{
          borderRadius: 2,
          mb: 1,
          backgroundColor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
          border: notification.read ? 'none' : `1px solid ${getNotificationColor(notification.type)}20`,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
          },
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: getNotificationColor(notification.type),
              width: 40,
              height: 40,
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: notification.read ? 400 : 600,
                  color: notification.read ? 'text.secondary' : 'text.primary',
                }}
              >
                {notification.title}
              </Typography>
              {notification.priority === 'high' && (
                <Chip label="Importante" size="small" color="error" />
              )}
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatRelativeTime(notification.timestamp)}
              </Typography>
            </Box>
          }
        />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {!notification.read && (
            <Tooltip title="Marcar como leída">
              <IconButton
                size="small"
                onClick={() => markAsRead(notification.id)}
              >
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => removeNotification(notification.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItem>
    </motion.div>
  );

  // Menú de notificaciones (móvil)
  const NotificationMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={() => setAnchorEl(null)}
      PaperProps={{
        sx: {
          width: 350,
          maxHeight: 400,
          borderRadius: 3,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Notificaciones
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Marcar todas como leídas">
              <IconButton size="small" onClick={markAllAsRead}>
                <MarkEmailReadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Limpiar todas">
              <IconButton size="small" onClick={clearAllNotifications}>
                <ClearAllIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {unreadCount > 0 && (
          <Chip
            label={`${unreadCount} sin leer`}
            size="small"
            color="primary"
            sx={{ mt: 1 }}
          />
        )}
      </Box>
      
      <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 1 }}>
            <AnimatePresence>
              {notifications.slice(0, 5).map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </AnimatePresence>
          </List>
        )}
      </Box>
      
      {notifications.length > 5 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            onClick={() => {
              setAnchorEl(null);
              setDrawerOpen(true);
            }}
          >
            Ver todas las notificaciones
          </Button>
        </Box>
      )}
    </Menu>
  );

  // Drawer de notificaciones (desktop)
  const NotificationDrawer = () => (
    <Drawer
      anchor="right"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      PaperProps={{
        sx: {
          width: 400,
          borderRadius: '16px 0 0 16px',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Notificaciones
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MarkEmailReadIcon />}
            onClick={markAllAsRead}
          >
            Marcar leídas
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearAllIcon />}
            onClick={clearAllNotifications}
            color="error"
          >
            Limpiar
          </Button>
        </Box>
        
        <Box sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <NotificationsNoneIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No hay notificaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Las notificaciones aparecerán aquí cuando las recibas
              </Typography>
            </Box>
          ) : (
            <List>
              <AnimatePresence>
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </AnimatePresence>
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <>
      {/* Botón de notificaciones */}
      <Tooltip title="Notificaciones">
        <IconButton
          color="inherit"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ position: 'relative' }}
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsActiveIcon /> : <NotificationsIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Menú de notificaciones */}
      <NotificationMenu />

      {/* Drawer de notificaciones */}
      <NotificationDrawer />

      {/* Snackbar para notificaciones importantes */}
      <Snackbar
        open={Boolean(currentSnackbar)}
        autoHideDuration={6000}
        onClose={() => setCurrentSnackbar(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {currentSnackbar && (
          <Alert
            onClose={() => setCurrentSnackbar(null)}
            severity={currentSnackbar.type}
            sx={{ width: '100%' }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => markAsRead(currentSnackbar.id)}
                >
                  <MarkEmailReadIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setCurrentSnackbar(null)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            }
          >
            <AlertTitle sx={{ fontWeight: 'bold' }}>
              {currentSnackbar.title}
            </AlertTitle>
            {currentSnackbar.message}
          </Alert>
        )}
      </Snackbar>

      {/* Exportar funciones para uso externo */}
      {React.useEffect(() => {
        window.addNotification = addNotification;
        return () => {
          delete window.addNotification;
        };
      }, [addNotification])}
    </>
  );
};

export default NotificationSystem;

// Hook para usar el sistema de notificaciones
export const useNotifications = () => {
  const addNotification = useCallback((notification) => {
    if (window.addNotification) {
      window.addNotification(notification);
    }
  }, []);

  const showSuccess = useCallback((title, message) => {
    addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const showError = useCallback((title, message) => {
    addNotification({ type: 'error', title, message, priority: 'high' });
  }, [addNotification]);

  const showWarning = useCallback((title, message) => {
    addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  const showInfo = useCallback((title, message) => {
    addNotification({ type: 'info', title, message });
  }, [addNotification]);

  return {
    addNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}; 
