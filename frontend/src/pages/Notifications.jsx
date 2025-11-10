import React from 'react';
import { Box, Typography, Container, List, ListItem, ListItemText, Button, CircularProgress, Alert } from '@mui/material';
import { useNotifications, useMarkNotificationAsRead } from '../hooks/useNotifications';

const Notifications = () => {
  const { data: notificationsRaw, isLoading, error } = useNotifications();
  const notifications = Array.isArray(notificationsRaw) ? notificationsRaw : [];
  const markAsRead = useMarkNotificationAsRead();

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>Notificaciones</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>Tus notificaciones recientes</Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Error al cargar notificaciones: {error.message}</Alert>
        ) : notifications.length === 0 ? (
          <Alert severity="info">No tienes notificaciones</Alert>
        ) : (
          <List>
            {notifications.map(n => (
              <ListItem key={n.id || n._id} sx={{ 
                bgcolor: n.read ? 'grey.100' : 'primary.light', 
                mb: 1, 
                borderRadius: 1 
              }}>
                <ListItemText 
                  primary={n.title} 
                  secondary={n.body}
                  secondaryTypographyProps={{
                    color: 'text.secondary'
                  }}
                />
                {!n.read && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => markAsRead.mutate(n.id || n._id)}
                    disabled={markAsRead.isPending}
                  >
                    Marcar como leída
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default Notifications; 
