import React, { useState } from 'react';
import {
  Box, Typography, Container, Grid, Card, CardContent, Button, Alert, CircularProgress, Chip, TextField
} from '@mui/material';
import { useUserPayments, useRefundPayment } from '../hooks/usePayments';
import { useUserTickets, useTransferTicket, useDownloadTicket } from '../hooks/useTickets';
import { useUserRefunds } from '../hooks/useRefunds';

const Payments = () => {
  const { data: paymentsRaw, isLoading: loadingPayments, error: paymentsError } = useUserPayments();
  const { data: ticketsRaw, isLoading: loadingTickets, error: ticketsError } = useUserTickets();
  const payments = Array.isArray(paymentsRaw) ? paymentsRaw : [];
  const tickets = Array.isArray(ticketsRaw) ? ticketsRaw : [];
  const refundPayment = useRefundPayment();
  const transferTicket = useTransferTicket();
  const downloadTicket = useDownloadTicket();
  const [transfer, setTransfer] = useState({ ticketId: '', email: '' });
  const [message, setMessage] = useState(null);

  const handleTransfer = () => {
    transferTicket.mutate(transfer, {
      onSuccess: () => setMessage({ type: 'success', text: 'Ticket transferido correctamente' }),
      onError: (error) => setMessage({ type: 'error', text: error.message || 'Error al transferir ticket' }),
    });
  };

  const handleDownload = (ticketId) => {
    downloadTicket.mutate(ticketId, {
      onSuccess: () => setMessage({ type: 'success', text: 'Descarga iniciada' }),
      onError: (error) => setMessage({ type: 'error', text: error.message || 'Error al descargar ticket' }),
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>Pagos y Tickets</Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>Gestiona tus pagos y tickets adquiridos</Typography>
        
        {message && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {paymentsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error al cargar pagos: {paymentsError.message}
          </Alert>
        )}

        {ticketsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Error al cargar tickets: {ticketsError.message}
          </Alert>
        )}

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Mis Pagos</Typography>
        {loadingPayments ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {payments.map(payment => (
              <Grid item xs={12} md={6} key={payment._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Evento: {payment.eventName}</Typography>
                    <Typography variant="body2">Monto: {payment.amount} USD</Typography>
                    <Typography variant="body2">Fecha: {payment.date ? (() => {
                  try {
                    const dateObj = new Date(payment.date);
                    if (isNaN(dateObj.getTime())) {
                      return 'Fecha no válida';
                    }
                    return dateObj.toLocaleDateString();
                  } catch (error) {
                    return 'Fecha no válida';
                  }
                })() : 'Fecha no disponible'}</Typography>
                    <Button variant="outlined" onClick={() => refundPayment.mutate(payment._id)}>Solicitar reembolso</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Mis Tickets</Typography>
        {loadingTickets ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : tickets.length === 0 ? (
          <Alert severity="info">No tienes tickets aún. ¡Compra tickets para eventos!</Alert>
        ) : (
          <Grid container spacing={2}>
            {tickets.map(ticket => (
              <Grid item xs={12} md={6} key={ticket.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{ticket.event?.name || 'Evento'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Fecha: {ticket.event?.date ? (() => {
                    try {
                      const dateObj = new Date(ticket.event.date);
                      if (isNaN(dateObj.getTime())) {
                        return 'Fecha no válida';
                      }
                      return dateObj.toLocaleDateString();
                    } catch (error) {
                      return 'Fecha no válida';
                    }
                  })() : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ubicación: {ticket.event?.location || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      Código: <Chip label={ticket.ticketId} size="small" />
                    </Typography>
                    <Typography variant="body2">
                      Estado: <Chip 
                        label={ticket.status === 'approved' ? 'Aprobado' : ticket.status} 
                        size="small" 
                        color={ticket.status === 'approved' ? 'success' : 'warning'}
                      />
                    </Typography>
                    <Typography variant="body2">
                      Tipo: {ticket.ticketType || 'General'}
                    </Typography>
                    <Typography variant="body2">
                      Cantidad: {ticket.quantity || 1}
                    </Typography>
                    <Typography variant="body2">
                      Precio: {ticket.amount || 'N/A'}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleDownload(ticket.id)}
                        disabled={downloadTicket.isPending}
                      >
                        {downloadTicket.isPending ? <CircularProgress size={16} /> : 'Descargar'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Transferir Ticket</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Transfiere tus tickets a otros usuarios
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField 
              label="ID Ticket" 
              value={transfer.ticketId} 
              onChange={e => setTransfer({ ...transfer, ticketId: e.target.value })} 
              placeholder="TK-XXXXX-XXXXX"
              sx={{ minWidth: 200 }}
            />
            <TextField 
              label="Email destinatario" 
              value={transfer.email} 
              onChange={e => setTransfer({ ...transfer, email: e.target.value })} 
              placeholder="usuario@ejemplo.com"
              sx={{ minWidth: 250 }}
            />
            <Button 
              variant="contained" 
              onClick={handleTransfer}
              disabled={transferTicket.isPending || !transfer.ticketId || !transfer.email}
            >
              {transferTicket.isPending ? <CircularProgress size={20} /> : 'Transferir'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Payments; 
