import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
  Tooltip,
  Badge,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveGridItem } from './ResponsiveContainer';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const EnhancedDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [viewMode, setViewMode] = useState('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeEvents: 0,
    growthRate: 0
  });

  // Simular datos de estadísticas
  useEffect(() => {
    const fetchStats = async () => {
      setRefreshing(true);
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalEvents: 156,
        totalUsers: 2847,
        totalRevenue: 125430,
        activeEvents: 23,
        growthRate: 12.5
      });
      setRefreshing(false);
    };

    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Componente de tarjeta de estadística
  const StatCard = ({ title, value, icon, color, trend, subtitle, delay = 0 }) => (
    <Fade in timeout={300 + delay}>
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          border: `1px solid ${color}30`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            border: `1px solid ${color}50`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: color,
                width: 48,
                height: 48,
                boxShadow: `0 4px 12px ${color}40`,
              }}
            >
              {icon}
            </Avatar>
            {trend && (
              <Chip
                icon={trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                color={trend > 0 ? 'success' : 'error'}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="h4" fontWeight={700} color={color} gutterBottom>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Fade>
  );

  // Componente de lista de actividades recientes
  const RecentActivity = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {t('dashboard.recentActivity')}
          </Typography>
          <IconButton size="small">
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        <List>
          {[
            { action: 'Nuevo evento creado', user: 'Juan Pérez', time: '2 min', type: 'event' },
            { action: 'Usuario registrado', user: 'María García', time: '5 min', type: 'user' },
            { action: 'Pago procesado', user: 'Carlos López', time: '8 min', type: 'payment' },
            { action: 'Evento actualizado', user: 'Ana Martínez', time: '12 min', type: 'event' },
            { action: 'Reseña agregada', user: 'Luis Rodríguez', time: '15 min', type: 'review' },
          ].map((activity, index) => (
            <Fade in timeout={400 + index * 100} key={index}>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: activity.type === 'event' ? theme.palette.primary.main :
                               activity.type === 'user' ? theme.palette.success.main :
                               activity.type === 'payment' ? theme.palette.warning.main :
                               theme.palette.info.main,
                      width: 32,
                      height: 32,
                    }}
                  >
                    {activity.user.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={activity.action}
                  secondary={`${activity.user} • ${activity.time}`}
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
            </Fade>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  // Componente de eventos próximos
  const UpcomingEvents = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {t('dashboard.upcomingEvents')}
          </Typography>
          <Button size="small" endIcon={<ViewModuleIcon />}>
            {t('dashboard.viewAll')}
          </Button>
        </Box>
        
        <Stack spacing={2}>
          {[
            { name: 'Concierto de Rock', date: '2024-02-15', attendees: 150, capacity: 200 },
            { name: 'Conferencia Tech', date: '2024-02-18', attendees: 75, capacity: 100 },
            { name: 'Workshop de Diseño', date: '2024-02-20', attendees: 30, capacity: 50 },
          ].map((event, index) => (
            <Fade in timeout={500 + index * 100} key={index}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                    border: `1px solid ${theme.palette.primary.main}30`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {event.name}
                  </Typography>
                  <Chip
                    label={event.date}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(event.attendees / event.capacity) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: theme.palette.primary.main,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {event.attendees}/{event.capacity}
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <ResponsiveContainer maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header del dashboard */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {t('dashboard.welcome')}, {user?.name || user?.email}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('dashboard.subtitle')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('dashboard.refresh')}>
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  <RefreshIcon className={refreshing ? 'rotating' : ''} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('dashboard.filter')}>
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('dashboard.download')}>
                <IconButton>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('dashboard.share')}>
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {refreshing && (
            <LinearProgress
              sx={{
                borderRadius: 1,
                height: 2,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                },
              }}
            />
          )}
        </Box>

        {/* Tarjetas de estadísticas */}
        <ResponsiveGrid spacing={3} sx={{ mb: 4 }}>
          <ResponsiveGridItem xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.totalEvents')}
              value={stats.totalEvents}
              icon={<EventIcon />}
              color={theme.palette.primary.main}
              trend={12.5}
              subtitle={t('dashboard.thisMonth')}
              delay={0}
            />
          </ResponsiveGridItem>
          
          <ResponsiveGridItem xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.totalUsers')}
              value={stats.totalUsers}
              icon={<PeopleIcon />}
              color={theme.palette.success.main}
              trend={8.2}
              subtitle={t('dashboard.activeUsers')}
              delay={100}
            />
          </ResponsiveGridItem>
          
          <ResponsiveGridItem xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.revenue')}
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={<MoneyIcon />}
              color={theme.palette.warning.main}
              trend={15.3}
              subtitle={t('dashboard.thisMonth')}
              delay={200}
            />
          </ResponsiveGridItem>
          
          <ResponsiveGridItem xs={12} sm={6} md={3}>
            <StatCard
              title={t('dashboard.activeEvents')}
              value={stats.activeEvents}
              icon={<NotificationsIcon />}
              color={theme.palette.info.main}
              trend={-2.1}
              subtitle={t('dashboard.ongoing')}
              delay={300}
            />
          </ResponsiveGridItem>
        </ResponsiveGrid>

        {/* Contenido principal */}
        <ResponsiveGrid spacing={3}>
          <ResponsiveGridItem xs={12} md={8}>
            <RecentActivity />
          </ResponsiveGridItem>
          
          <ResponsiveGridItem xs={12} md={4}>
            <UpcomingEvents />
          </ResponsiveGridItem>
        </ResponsiveGrid>
      </Box>
      
      <style jsx>{`
        @keyframes rotating {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotating {
          animation: rotating 1s linear infinite;
        }
      `}</style>
    </ResponsiveContainer>
  );
};

export default EnhancedDashboard;
