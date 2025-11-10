import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  Notifications as NotificationIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const ModernDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Cargar eventos reales desde la API
      const response = await fetch('http://localhost:4000/api/events/all');
      const data = await response.json();
      
      if (data.success && data.events) {
        const events = data.events;
        
        // Calcular estadísticas
        const totalEvents = events.length;
        const totalAttendees = events.reduce((sum, event) => sum + (event.attendees || 0), 0);
        const totalRevenue = events.reduce((sum, event) => sum + (event.revenue || 0), 0);
        const averageRating = events.length > 0 
          ? events.reduce((sum, event) => sum + (event.rating || 0), 0) / events.length 
          : 0;

        setStats({
          totalEvents,
          totalAttendees,
          totalRevenue,
          averageRating: Math.round(averageRating * 10) / 10
        });

        // Eventos recientes (últimos 3)
        const recentEvents = events
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
          .slice(0, 3)
          .map(event => ({
            id: event._id,
            title: event.title,
            date: event.date,
            attendees: event.attendees || 0,
            revenue: event.revenue || 0,
            status: new Date(event.date) < new Date() ? 'completed' : 'active',
            image: event.image || event.imageUrl
          }));

        // Próximos eventos (próximos 2)
        const upcomingEvents = events
          .filter(event => new Date(event.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 2)
          .map(event => ({
            id: event._id,
            title: event.title,
            date: event.date,
            location: event.location || 'Ubicación no especificada',
            attendees: event.attendees || 0,
            capacity: event.capacity || 100,
            image: event.image || event.imageUrl
          }));

        setRecentEvents(recentEvents);
        setUpcomingEvents(upcomingEvents);
      } else {
        // Fallback a datos simulados si no hay eventos
        setStats({
          totalEvents: 0,
          totalAttendees: 0,
          totalRevenue: 0,
          averageRating: 0
        });
        setRecentEvents([]);
        setUpcomingEvents([]);
      }

      // Notificaciones simuladas (puedes implementar una API real más tarde)
      setNotifications([
        {
          id: 1,
          title: 'Bienvenido al Dashboard',
          message: 'Aquí puedes ver un resumen de todos tus eventos',
          time: 'Ahora',
          type: 'info'
        }
      ]);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      // Datos de fallback en caso de error
      setStats({
        totalEvents: 0,
        totalAttendees: 0,
        totalRevenue: 0,
        averageRating: 0
      });
      setRecentEvents([]);
      setUpcomingEvents([]);
      setNotifications([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card
      sx={{
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: `linear-gradient(45deg, ${color} 0%, ${color}dd 100%)`,
              boxShadow: `0 8px 24px ${color}40`
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              label={`+${trend}%`}
              size="small"
              color="success"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: color, mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800], mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'white',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
{t('dashboard.title')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 3
            }}
          >
{t('dashboard.welcome')}
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.stats.totalEvents')}
              value={stats.totalEvents}
              icon={<EventIcon />}
              color={theme.palette.primary.main}
              subtitle={t('dashboard.stats.thisMonth')}
              trend={12}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.stats.attendees')}
              value={stats.totalAttendees.toLocaleString()}
              icon={<PeopleIcon />}
              color={theme.palette.secondary.main}
              subtitle={t('dashboard.stats.totalRegistered')}
              trend={8}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.stats.revenue')}
              value={formatCurrency(stats.totalRevenue)}
              icon={<MoneyIcon />}
              color={theme.palette.success.main}
              subtitle={t('dashboard.stats.thisMonth')}
              trend={15}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.stats.rating')}
              value={stats.averageRating}
              icon={<StarIcon />}
              color={theme.palette.warning.main}
              subtitle={t('dashboard.stats.average')}
              trend={3}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Eventos Recientes */}
          <Grid item xs={12} lg={8}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
{t('dashboard.sections.recentEvents')}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ borderRadius: 2 }}
                >
{t('dashboard.buttons.newEvent')}
                </Button>
              </Box>

              <List>
                {recentEvents.map((event, index) => (
                  <React.Fragment key={event.id}>
                    <ListItem
                      sx={{
                        py: 2,
                        px: 0,
                        '&:hover': {
                          backgroundColor: theme.palette.grey[50],
                          borderRadius: 2
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={event.image}
                          sx={{
                            background: event.image ? 'transparent' : 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                            fontWeight: 600,
                            width: 56,
                            height: 56
                          }}
                        >
                          {!event.image && <EventIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Box sx={{ fontWeight: 600, fontSize: '1rem' }}>
                            {event.title}
                          </Box>
                          <Chip
                            label={event.status === 'completed' ? t('dashboard.status.completed') : t('dashboard.status.active')}
                            size="small"
                            color={event.status === 'completed' ? 'success' : 'primary'}
                          />
                        </Box>
                        <Box>
                          <Box sx={{ color: theme.palette.grey[600], mb: 0.5, fontSize: '0.875rem' }}>
                            {formatDate(event.date)}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ color: theme.palette.grey[600], fontSize: '0.875rem' }}>
                              {event.attendees} {t('dashboard.attendees')}
                            </Box>
                            <Box sx={{ color: theme.palette.success.main, fontWeight: 600, fontSize: '0.875rem' }}>
                              {formatCurrency(event.revenue)}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </ListItem>
                    {index < recentEvents.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Próximos Eventos */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800], mb: 3 }}>
{t('dashboard.sections.upcomingEvents')}
              </Typography>

              <List>
                {upcomingEvents.map((event, index) => (
                  <React.Fragment key={event.id}>
                    <ListItem sx={{ py: 2, px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={event.image}
                          sx={{
                            background: event.image ? 'transparent' : 'linear-gradient(45deg, #ff6b6b 0%, #ee5a24 100%)',
                            fontWeight: 600,
                            width: 56,
                            height: 56
                          }}
                        >
                          {!event.image && <CalendarIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                          {event.title}
                        </Box>
                        <Box>
                          <Box sx={{ color: theme.palette.grey[600], mb: 0.5, fontSize: '0.875rem' }}>
                            {formatDate(event.date)}
                          </Box>
                          <Box sx={{ color: theme.palette.grey[600], mb: 1, fontSize: '0.875rem' }}>
                            {event.location}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(event.attendees / event.capacity) * 100}
                              sx={{
                                flexGrow: 1,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: theme.palette.grey[200],
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                                }
                              }}
                            />
                            <Box sx={{ color: theme.palette.grey[600], fontSize: '0.75rem' }}>
                              {event.attendees}/{event.capacity}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < upcomingEvents.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>

            {/* Notificaciones */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <NotificationIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
{t('dashboard.sections.notifications')}
                </Typography>
              </Box>

              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem sx={{ py: 2, px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: notification.type === 'success' 
                              ? 'linear-gradient(45deg, #4caf50 0%, #66bb6a 100%)'
                              : notification.type === 'warning'
                              ? 'linear-gradient(45deg, #ff9800 0%, #ffb74d 100%)'
                              : 'linear-gradient(45deg, #2196f3 0%, #64b5f6 100%)',
                            width: 40,
                            height: 40
                          }}
                        >
                          <NotificationIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                          {notification.title}
                        </Box>
                        <Box>
                          <Box sx={{ color: theme.palette.grey[600], mb: 0.5, fontSize: '0.875rem' }}>
                            {notification.message}
                          </Box>
                          <Box sx={{ color: theme.palette.grey[500], fontSize: '0.75rem' }}>
                            {notification.time}
                          </Box>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ModernDashboard;
