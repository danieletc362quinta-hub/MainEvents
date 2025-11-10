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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const ModernPayments = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useLanguage();
  
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'credit_card',
      last4: '5555',
      brand: 'Mastercard',
      expiry: '08/26',
      isDefault: false
    },
    {
      id: 3,
      type: 'bank_account',
      last4: '1234',
      bank: 'Banco Santander',
      isDefault: false
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      event: 'Conferencia de Tecnología 2024',
      amount: 2500,
      status: 'completed',
      date: '2024-03-15',
      method: 'Visa ****4242',
      type: 'payment'
    },
    {
      id: 2,
      event: 'Workshop de Diseño UX/UI',
      amount: 1200,
      status: 'pending',
      date: '2024-03-20',
      method: 'Mastercard ****5555',
      type: 'payment'
    },
    {
      id: 3,
      event: 'Networking Empresarial',
      amount: 800,
      status: 'completed',
      date: '2024-03-25',
      method: 'Transferencia bancaria',
      type: 'payment'
    },
    {
      id: 4,
      event: 'Reembolso - Festival de Música',
      amount: -3000,
      status: 'completed',
      date: '2024-04-01',
      method: 'Visa ****4242',
      type: 'refund'
    }
  ]);

  const [openAddMethod, setOpenAddMethod] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    bank: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      default: return status;
    }
  };

  const handleAddMethod = () => {
    // Aquí implementarías la lógica para agregar un método de pago
    console.log('Adding payment method:', newMethod);
    setOpenAddMethod(false);
    setNewMethod({
      type: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      name: '',
      bank: ''
    });
  };

  const handleDeleteMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const PaymentMethodCard = ({ method }) => (
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
            {method.type === 'credit_card' ? (
              <CreditCardIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            ) : (
              <BankIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {method.type === 'credit_card' ? method.brand : method.bank}
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.grey[600] }}>
                {method.type === 'credit_card' 
                  ? `**** **** **** ${method.last4}` 
                  : `**** ${method.last4}`
                }
              </Typography>
              {method.type === 'credit_card' && (
                <Typography variant="body2" sx={{ color: theme.palette.grey[500] }}>
                  Expira: {method.expiry}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {method.isDefault && (
              <Chip label="Predeterminado" color="primary" size="small" />
            )}
            <IconButton size="small" onClick={() => handleSetDefault(method.id)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteMethod(method.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
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
            Pagos y Facturación
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              mb: 3
            }}
          >
            Gestiona tus métodos de pago y revisa el historial de transacciones
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Métodos de Pago */}
          <Grid item xs={12} lg={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                  Métodos de Pago
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddMethod(true)}
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 2,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 0%, #6a4190 100%)'
                    }
                  }}
                >
                  Agregar Método
                </Button>
              </Box>

              <Grid container spacing={2}>
                {paymentMethods.map((method) => (
                  <Grid item xs={12} key={method.id}>
                    <PaymentMethodCard method={method} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Resumen de Pagos */}
          <Grid item xs={12} lg={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                mb: 3
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.grey[800], mb: 3 }}>
                Resumen de Pagos
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ background: 'linear-gradient(45deg, #4caf50 0%, #66bb6a 100%)', color: 'white' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(4500)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pagos Este Mes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'linear-gradient(45deg, #ff9800 0%, #ffb74d 100%)', color: 'white' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(3000)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Reembolsos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'linear-gradient(45deg, #2196f3 0%, #64b5f6 100%)', color: 'white' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {formatCurrency(1500)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Saldo Pendiente
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ background: 'linear-gradient(45deg, #9c27b0 0%, #ba68c8 100%)', color: 'white' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        12
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Transacciones
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Historial de Transacciones */}
          <Grid item xs={12}>
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
                  Historial de Transacciones
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Exportar
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Evento</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Monto</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Método</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {transaction.event}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: transaction.amount > 0 ? theme.palette.success.main : theme.palette.error.main
                            }}
                          >
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(transaction.status)}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.method}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {transaction.date}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton size="small">
                            <ReceiptIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Dialog para agregar método de pago */}
        <Dialog open={openAddMethod} onClose={() => setOpenAddMethod(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Agregar Método de Pago</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
              <InputLabel>Tipo de Método</InputLabel>
              <Select
                value={newMethod.type}
                onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                label="Tipo de Método"
              >
                <MenuItem value="credit_card">Tarjeta de Crédito</MenuItem>
                <MenuItem value="bank_account">Cuenta Bancaria</MenuItem>
              </Select>
            </FormControl>

            {newMethod.type === 'credit_card' ? (
              <>
                <TextField
                  fullWidth
                  label="Número de Tarjeta"
                  value={newMethod.cardNumber}
                  onChange={(e) => setNewMethod({ ...newMethod, cardNumber: e.target.value })}
                  sx={{ mb: 3 }}
                />
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Fecha de Vencimiento"
                    placeholder="MM/AA"
                    value={newMethod.expiryDate}
                    onChange={(e) => setNewMethod({ ...newMethod, expiryDate: e.target.value })}
                  />
                  <TextField
                    fullWidth
                    label="CVV"
                    value={newMethod.cvv}
                    onChange={(e) => setNewMethod({ ...newMethod, cvv: e.target.value })}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Nombre en la Tarjeta"
                  value={newMethod.name}
                  onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Banco"
                  value={newMethod.bank}
                  onChange={(e) => setNewMethod({ ...newMethod, bank: e.target.value })}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Número de Cuenta"
                  value={newMethod.cardNumber}
                  onChange={(e) => setNewMethod({ ...newMethod, cardNumber: e.target.value })}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddMethod(false)}>Cancelar</Button>
            <Button onClick={handleAddMethod} variant="contained">
              Agregar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ModernPayments;
