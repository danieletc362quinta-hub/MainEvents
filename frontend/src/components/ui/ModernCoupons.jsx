import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  LocalOffer as CouponIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  QrCode as QrCodeIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const ModernCoupons = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'TECH2024',
      name: 'Descuento Tecnología',
      type: 'percentage',
      value: 20,
      minAmount: 1000,
      maxUses: 100,
      usedCount: 45,
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      status: 'active',
      description: '20% de descuento en eventos de tecnología'
    },
    {
      id: 2,
      code: 'WELCOME50',
      name: 'Bienvenida',
      type: 'fixed',
      value: 500,
      minAmount: 2000,
      maxUses: 50,
      usedCount: 23,
      validFrom: '2024-01-01',
      validTo: '2024-06-30',
      status: 'active',
      description: '$500 de descuento para nuevos usuarios'
    },
    {
      id: 3,
      code: 'EARLYBIRD',
      name: 'Early Bird',
      type: 'percentage',
      value: 15,
      minAmount: 500,
      maxUses: 200,
      usedCount: 200,
      validFrom: '2024-01-01',
      validTo: '2024-03-31',
      status: 'expired',
      description: '15% de descuento por compra anticipada'
    }
  ]);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    type: 'percentage',
    value: '',
    minAmount: '',
    maxUses: '',
    validFrom: '',
    validTo: '',
    description: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'expired': return 'Expirado';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  const handleCreateCoupon = () => {
    const coupon = {
      ...newCoupon,
      id: Date.now(),
      usedCount: 0,
      status: 'active'
    };
    setCoupons([...coupons, coupon]);
    setOpenCreate(false);
    setNewCoupon({
      code: '',
      name: '',
      type: 'percentage',
      value: '',
      minAmount: '',
      maxUses: '',
      validFrom: '',
      validTo: '',
      description: ''
    });
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon(coupon);
    setOpenEdit(true);
  };

  const handleUpdateCoupon = () => {
    setCoupons(coupons.map(coupon => 
      coupon.id === editingCoupon.id ? { ...newCoupon, id: editingCoupon.id } : coupon
    ));
    setOpenEdit(false);
    setEditingCoupon(null);
  };

  const handleDeleteCoupon = (id) => {
    setCoupons(coupons.filter(coupon => coupon.id !== id));
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Aquí podrías mostrar una notificación de éxito
  };

  const CouponCard = ({ coupon }) => (
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                width: 48,
                height: 48
              }}
            >
              <CouponIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {coupon.name}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                {coupon.description}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={getStatusLabel(coupon.status)}
              color={getStatusColor(coupon.status)}
              size="small"
            />
            <IconButton size="small" onClick={() => handleEditCoupon(coupon)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteCoupon(coupon.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {coupon.code}
            </Typography>
            <IconButton size="small" onClick={() => handleCopyCode(coupon.code)}>
              <CopyIcon />
            </IconButton>
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.success.main, mb: 1 }}>
            {coupon.type === 'percentage' 
              ? `${coupon.value}% de descuento`
              : `${formatCurrency(coupon.value)} de descuento`
            }
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
              Mínimo: {formatCurrency(coupon.minAmount)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
              Usos: {coupon.usedCount}/{coupon.maxUses}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
              Válido hasta: {coupon.validTo}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                Progreso:
              </Typography>
              <Box sx={{ flexGrow: 1, height: 4, backgroundColor: theme.palette.grey[200], borderRadius: 2 }}>
                <Box
                  sx={{
                    height: '100%',
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2,
                    width: `${(coupon.usedCount / coupon.maxUses) * 100}%`
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
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
            Cupones y Descuentos
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 3
            }}
          >
            Gestiona cupones de descuento para tus eventos
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
                p: 3
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 1 }}>
                {coupons.length}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                Cupones Totales
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
                p: 3
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main, mb: 1 }}>
                {coupons.filter(c => c.status === 'active').length}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                Activos
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
                p: 3
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main, mb: 1 }}>
                {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                Usos Totales
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                textAlign: 'center',
                p: 3
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.secondary.main, mb: 1 }}>
                {formatCurrency(15000)}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.grey[600] }}>
                Ahorro Generado
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Cupones */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            mb: 4
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
              Mis Cupones
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
              sx={{
                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                }
              }}
            >
              Crear Cupón
            </Button>
          </Box>

          <Grid container spacing={3}>
            {coupons.map((coupon) => (
              <Grid item xs={12} md={6} lg={4} key={coupon.id}>
                <CouponCard coupon={coupon} />
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Tabla de Cupones */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800], mb: 3 }}>
            Detalles de Cupones
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descuento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Usos</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Válido Hasta</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {coupon.code}
                        </Typography>
                        <IconButton size="small" onClick={() => handleCopyCode(coupon.code)}>
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        {coupon.type === 'percentage' 
                          ? `${coupon.value}%`
                          : formatCurrency(coupon.value)
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.usedCount}/{coupon.maxUses}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(coupon.status)}
                        color={getStatusColor(coupon.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {coupon.validTo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small">
                          <QrCodeIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleEditCoupon(coupon)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteCoupon(coupon.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog para crear/editar cupón */}
        <Dialog open={openCreate || openEdit} onClose={() => { setOpenCreate(false); setOpenEdit(false); }} maxWidth="sm" fullWidth>
          <DialogTitle>
            {openCreate ? 'Crear Nuevo Cupón' : 'Editar Cupón'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Código del Cupón"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={newCoupon.name}
                  onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Descuento</InputLabel>
                  <Select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    label="Tipo de Descuento"
                  >
                    <MenuItem value="percentage">Porcentaje</MenuItem>
                    <MenuItem value="fixed">Monto Fijo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={newCoupon.type === 'percentage' ? 'Porcentaje (%)' : 'Monto ($)'}
                  type="number"
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monto Mínimo"
                  type="number"
                  value={newCoupon.minAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Máximo de Usos"
                  type="number"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Válido Desde"
                  type="date"
                  value={newCoupon.validFrom}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validFrom: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Válido Hasta"
                  type="date"
                  value={newCoupon.validTo}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validTo: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenCreate(false); setOpenEdit(false); }}>
              Cancelar
            </Button>
            <Button 
              onClick={openCreate ? handleCreateCoupon : handleUpdateCoupon} 
              variant="contained"
            >
              {openCreate ? 'Crear' : 'Actualizar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ModernCoupons;
