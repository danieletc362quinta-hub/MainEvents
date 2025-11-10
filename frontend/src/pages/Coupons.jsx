import React, { useState } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, Button, TextField, Alert, CircularProgress, Chip
} from '@mui/material';
import { useActiveCoupons, useUserCoupons, useCreateCoupon, useValidateCoupon } from '../hooks/useCoupons';

const Coupons = () => {
  const { data: activeCouponsRaw, isLoading: loadingActive, error: activeError } = useActiveCoupons();
  const { data: userCouponsRaw, isLoading: loadingUser, error: userError } = useUserCoupons();
  const activeCoupons = Array.isArray(activeCouponsRaw) ? activeCouponsRaw : [];
  const userCoupons = Array.isArray(userCouponsRaw) ? userCouponsRaw : [];
  const createCoupon = useCreateCoupon();
  const validateCoupon = useValidateCoupon();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);

  const handleValidate = () => {
    if (!code.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa un código de cupón' });
      return;
    }
    
    validateCoupon.mutate({ code }, {
      onSuccess: (data) => setMessage({ type: 'success', text: 'Cupón válido: ' + (data.coupon?.name || code) }),
      onError: (error) => setMessage({ type: 'error', text: error.message || 'Cupón inválido' }),
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>Cupones</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>Gestiona y utiliza tus cupones de descuento</Typography>
        
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            label="Código de cupón"
            value={code}
            onChange={e => setCode(e.target.value)}
            sx={{ mr: 2 }}
            placeholder="Ingresa el código del cupón"
          />
          <Button 
            variant="contained" 
            onClick={handleValidate} 
            disabled={validateCoupon.isPending || !code.trim()}
          >
            {validateCoupon.isPending ? <CircularProgress size={20} /> : 'Validar'}
          </Button>
        </Box>

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Cupones Activos</Typography>
        {loadingActive ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : activeError ? (
          <Alert severity="error">Error al cargar cupones activos: {activeError.message}</Alert>
        ) : activeCoupons.length === 0 ? (
          <Alert severity="info">No hay cupones activos disponibles</Alert>
        ) : (
          <Grid container spacing={2}>
            {activeCoupons.map(coupon => (
              <Grid item xs={12} md={6} key={coupon.id || coupon._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{coupon.name}</Typography>
                    <Typography variant="body2">
                      Código: <Chip label={coupon.code} size="small" />
                    </Typography>
                    <Typography variant="body2">
                      Descuento: {coupon.value}{coupon.type === 'percent' ? '%' : ' USD'}
                    </Typography>
                    <Typography variant="body2">
                      Válido hasta: {coupon.validUntil ? (() => {
                        try {
                          const dateObj = new Date(coupon.validUntil);
                          if (isNaN(dateObj.getTime())) {
                            return 'Fecha no válida';
                          }
                          return dateObj.toLocaleDateString();
                        } catch (error) {
                          return 'Fecha no válida';
                        }
                      })() : 'N/A'}
                    </Typography>
                    {coupon.maxUses && (
                      <Typography variant="body2">
                        Usos: {coupon.currentUses || 0}/{coupon.maxUses}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Mis Cupones</Typography>
        {loadingUser ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : userError ? (
          <Alert severity="error">Error al cargar tus cupones: {userError.message}</Alert>
        ) : userCoupons.length === 0 ? (
          <Alert severity="info">No tienes cupones asignados</Alert>
        ) : (
          <Grid container spacing={2}>
            {userCoupons.map(coupon => (
              <Grid item xs={12} md={6} key={coupon.id || coupon._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{coupon.name}</Typography>
                    <Typography variant="body2">
                      Código: <Chip label={coupon.code} size="small" />
                    </Typography>
                    <Typography variant="body2">
                      Descuento: {coupon.value}{coupon.type === 'percent' ? '%' : ' USD'}
                    </Typography>
                    <Typography variant="body2">
                      Válido hasta: {coupon.validUntil ? (() => {
                        try {
                          const dateObj = new Date(coupon.validUntil);
                          if (isNaN(dateObj.getTime())) {
                            return 'Fecha no válida';
                          }
                          return dateObj.toLocaleDateString();
                        } catch (error) {
                          return 'Fecha no válida';
                        }
                      })() : 'N/A'}
                    </Typography>
                    {coupon.minPurchase && (
                      <Typography variant="body2">
                        Compra mínima: ${coupon.minPurchase}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Coupons; 
