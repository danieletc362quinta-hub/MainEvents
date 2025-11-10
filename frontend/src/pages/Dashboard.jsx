import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();

  // Estados para funcionalidades avanzadas
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalAttendees: 0,
    eventsThisMonth: 0,
    revenueThisMonth: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Datos simulados para demostración
  useEffect(() => {
    setLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setStats({
        totalEvents: 1247,
        activeEvents: 89,
        totalRevenue: 456789,
        totalAttendees: 15678,
        eventsThisMonth: 23,
        revenueThisMonth: 67890,
      });
      setRecentEvents([
        {
          id: 1,
          name: 'Concierto de Rock',
          date: '2024-01-15',
          attendees: 150,
          revenue: 7500,
          status: 'active',
          type: 'musical',
        },
        {
          id: 2,
          name: 'Conferencia Tech',
          date: '2024-01-20',
          attendees: 200,
          revenue: 12000,
          status: 'upcoming',
          type: 'educativo',
        },
        {
          id: 3,
          name: 'Feria de Arte',
          date: '2024-01-10',
          attendees: 80,
          revenue: 4000,
          status: 'completed',
          type: 'cultural',
        },
      ]);
      setNotifications([
        { id: 1, message: 'Nuevo evento creado: Concierto de Rock', type: 'success', time: '2 min ago' },
        { id: 2, message: 'Pago recibido: $7500', type: 'info', time: '5 min ago' },
        { id: 3, message: 'Evento próximo: Conferencia Tech en 5 días', type: 'warning', time: '1 hour ago' },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        return 'Fecha no válida';
      }
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'warning';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'upcoming': return <WarningIcon />;
      case 'completed': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              sx={{
                width: 50,
                height: 50,
                mr: 2,
                background: `linear-gradient(45deg, ${color}, ${color}dd)`,
                color: 'white',
              }}
            >
              {icon}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: color }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </Box>
          </Box>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              <Typography variant="caption" color="success.main">
                {trend}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          cursor: 'pointer',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          },
        }}
        onClick={onClick}
      >
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mx: 'auto',
              mb: 2,
              background: `linear-gradient(45deg, ${color}, ${color}dd)`,
              color: 'white',
            }}
          >
            {icon}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ maxWidth: 600, mx: 'auto' }}>
          Necesitas iniciar sesión para acceder al Dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Configuración">
              <IconButton onClick={() => setShowSettingsDialog(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Crear Evento">
              <IconButton 
                color="primary"
                onClick={() => navigate('/create-event')}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Bienvenido de vuelta, {user?.name}. Aquí tienes un resumen de tu actividad.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Eventos"
            value={stats.totalEvents}
            icon={<EventIcon />}
            color="#1976d2"
            subtitle="Todos los tiempos"
            trend="+12% este mes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Eventos Activos"
            value={stats.activeEvents}
            icon={<CheckCircleIcon />}
            color="#4caf50"
            subtitle="En curso"
            trend="+5% esta semana"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(stats.totalRevenue)}
            icon={<MoneyIcon />}
            color="#ff9800"
            subtitle="Todos los tiempos"
            trend="+18% este mes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Asistentes"
            value={stats.totalAttendees.toLocaleString()}
            icon={<PeopleIcon />}
            color="#e91e63"
            subtitle="Total registrados"
            trend="+25% este mes"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Crear Evento"
              description="Organiza un nuevo evento"
              icon={<AddIcon />}
              color="#1976d2"
              onClick={() => navigate('/create-event')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Ver Eventos"
              description="Gestiona tus eventos"
              icon={<EventIcon />}
              color="#4caf50"
              onClick={() => navigate('/events')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Reportes"
              description="Analiza tu rendimiento"
              icon={<TrendingUpIcon />}
              color="#ff9800"
              onClick={() => setSelectedTab(2)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Configuración"
              description="Personaliza tu cuenta"
              icon={<SettingsIcon />}
              color="#e91e63"
              onClick={() => setShowSettingsDialog(true)}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab label="Resumen" />
          <Tab label="Eventos Recientes" />
          <Tab label="Reportes" />
          <Tab label="Notificaciones" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {selectedTab === 0 && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Actividad Reciente
                    </Typography>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            Eventos del Mes
                          </Typography>
                          <Chip label={`${stats.eventsThisMonth} eventos`} color="primary" />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(stats.eventsThisMonth / 30) * 100}
                          sx={{ height: 8, borderRadius: 4, mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Has organizado {stats.eventsThisMonth} eventos este mes
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Notificaciones
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {notifications.slice(0, 3).map((notification, index) => (
                        <React.Fragment key={notification.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: `${notification.type}.main` }}>
                                {notification.type === 'success' && <CheckCircleIcon />}
                                {notification.type === 'warning' && <WarningIcon />}
                                {notification.type === 'info' && <InfoIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={notification.message}
                              secondary={notification.time}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                          {index < 2 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {selectedTab === 1 && (
              <motion.div
                key="events"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Eventos Recientes
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => setLoading(true)}
                  >
                    Actualizar
                  </Button>
                </Box>
                
                {loading ? (
                  <Grid container spacing={2}>
                    {[1, 2, 3].map((item) => (
                      <Grid item xs={12} key={item}>
                        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Evento</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Asistentes</TableCell>
                          <TableCell>Ingresos</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentEvents.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                  <EventIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    {event.name}
                                  </Typography>
                                  <Chip label={event.type} size="small" />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{formatDate(event.date)}</TableCell>
                            <TableCell>{event.attendees}</TableCell>
                            <TableCell>{formatCurrency(event.revenue)}</TableCell>
                            <TableCell>
                              <Chip
                                icon={getStatusIcon(event.status)}
                                label={event.status}
                                color={getStatusColor(event.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="Ver">
                                  <IconButton size="small">
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Editar">
                                  <IconButton size="small">
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Eliminar">
                                  <IconButton size="small" color="error">
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </motion.div>
            )}

            {selectedTab === 2 && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Reportes y Análisis
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Rendimiento Mensual
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Eventos</Typography>
                            <Typography variant="body2">75%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Ingresos</Typography>
                            <Typography variant="body2">85%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={85} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Asistentes</Typography>
                            <Typography variant="body2">92%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={92} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                          Próximos Eventos
                        </Typography>
                        <List sx={{ p: 0 }}>
                          {Array.isArray(recentEvents) ? recentEvents.filter(e => e.status === 'upcoming').map((event) => (
                            <ListItem key={event.id} sx={{ px: 0 }}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                  <CalendarIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={event.name}
                                secondary={`${formatDate(event.date)} - ${event.attendees} asistentes`}
                              />
                              <Chip label={formatCurrency(event.revenue)} size="small" color="primary" />
                            </ListItem>
                          )) : null}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {selectedTab === 3 && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                  Notificaciones
                </Typography>
                <List>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: `${notification.type}.main` }}>
                            {notification.type === 'success' && <CheckCircleIcon />}
                            {notification.type === 'warning' && <WarningIcon />}
                            {notification.type === 'info' && <InfoIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.message}
                          secondary={notification.time}
                        />
                        <IconButton size="small">
                          <CloseIcon />
                        </IconButton>
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Paper>

      {/* Settings Dialog */}
      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Configuración
            </Typography>
            <IconButton onClick={() => setShowSettingsDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notificaciones
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notificaciones por email"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notificaciones push"
              />
              <FormControlLabel
                control={<Switch />}
                label="Reportes semanales"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Privacidad
              </Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Perfil público"
              />
              <FormControlLabel
                control={<Switch />}
                label="Compartir estadísticas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => setShowSettingsDialog(false)}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        size="large"
        onClick={() => navigate('/create-event')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Dashboard; 
