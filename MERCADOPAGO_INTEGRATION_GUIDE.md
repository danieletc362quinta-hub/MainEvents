# 🚀 Guía de Integración de Mercado Pago

## 📋 Índice
1. [Configuración Inicial](#configuración-inicial)
2. [Variables de Entorno](#variables-de-entorno)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Flujo de Pago](#flujo-de-pago)
5. [Webhooks](#webhooks)
6. [Validación de Tickets](#validación-de-tickets)
7. [Reembolsos](#reembolsos)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Configuración Inicial

### 1. Crear cuenta en Mercado Pago
1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una cuenta de desarrollador
3. Crea una aplicación
4. Obtén las credenciales de acceso

### 2. Instalar dependencias
```bash
npm install mercadopago
```

### 3. Configurar variables de entorno
Crea un archivo `.env` con las siguientes variables:

```env
# Mercado Pago Configuration
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URLs de la aplicación
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

---

## 🌍 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acceso de Mercado Pago | `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secreto para validar webhooks | `webhook_secret_123` |
| `MERCADOPAGO_PUBLIC_KEY` | Clave pública para el frontend | `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:3000` |
| `BACKEND_URL` | URL del backend | `http://localhost:4000` |

---

## 🔌 Endpoints Disponibles

### Autenticación
Todos los endpoints requieren autenticación excepto el webhook.

### 1. Crear Preferencia de Pago
```http
POST /api/mercadopago/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "ticketType": "general",
  "quantity": 2,
  "currency": "ARS",
  "customPrice": 25000,
  "discountCode": "DESCUENTO10",
  "backUrls": {
    "success": "https://tuapp.com/success",
    "failure": "https://tuapp.com/failure",
    "pending": "https://tuapp.com/pending"
  }
}
```

**Respuesta:**
```json
{
  "message": "Preferencia de pago creada exitosamente",
  "preference": {
    "id": "1234567890",
    "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890",
    "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?pref_id=1234567890"
  },
  "payment": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "ticketId": "TKT-MP-abc123def456",
    "amount": "$50.000,00",
    "status": "pending"
  }
}
```

### 2. Confirmar Pago
```http
POST /api/mercadopago/confirm
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "1234567890",
  "preferenceId": "1234567890"
}
```

### 3. Validar Ticket
```http
POST /api/mercadopago/validate-ticket
Authorization: Bearer <token>
Content-Type: application/json

{
  "ticketId": "TKT-MP-abc123def456",
  "qrCode": "eyJ0aWNrZXRJZCI6IlRLVC1NUC1hYmMxMjNkZWY0NTYiLCJldmVudElkIjoiNjRmMWEyYjNjNGQ1ZTZmN2c4aDlpMGoxIiwidXNlcklkIjoiNjRmMWEyYjNjNGQ1ZTZmN2c4aDlpMGoxIiwidGltZXN0YW1wIjoxNzM0NTY3ODkwLCJwcm92aWRlciI6Im1lcmNhZG9wYWdvIn0="
}
```

### 4. Obtener Tickets del Usuario
```http
GET /api/mercadopago/tickets?page=1&limit=10&status=approved
Authorization: Bearer <token>
```

### 5. Estadísticas de Pagos
```http
GET /api/mercadopago/stats?eventId=64f1a2b3c4d5e6f7g8h9i0j1&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

### 6. Reembolsar Pago
```http
POST /api/mercadopago/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "1234567890",
  "amount": 25000,
  "reason": "Solicitud del cliente",
  "description": "Cliente no pudo asistir al evento"
}
```

### 7. Buscar Pagos
```http
GET /api/mercadopago/search?eventId=64f1a2b3c4d5e6f7g8h9i0j1&status=approved&page=1&limit=20
Authorization: Bearer <token>
```

### 8. Información de Pago
```http
GET /api/mercadopago/payment/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <token>
```

### 9. Webhook
```http
POST /api/mercadopago/webhook
Content-Type: application/json

{
  "type": "payment",
  "data": {
    "id": "1234567890"
  }
}
```

---

## 💳 Flujo de Pago

### 1. Crear Preferencia de Pago
```javascript
// Frontend
const createPayment = async (eventData) => {
  const response = await fetch('/api/mercadopago/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      eventId: eventData.id,
      ticketType: 'general',
      quantity: 2,
      currency: 'ARS'
    })
  });
  
  const data = await response.json();
  
  // Redirigir al usuario a Mercado Pago
  window.location.href = data.preference.init_point;
};
```

### 2. Procesar Pago
```javascript
// El usuario completa el pago en Mercado Pago
// Mercado Pago envía un webhook a tu servidor
// El servidor actualiza el estado del pago
```

### 3. Confirmar Pago
```javascript
// Opcional: Confirmar pago manualmente
const confirmPayment = async (paymentId) => {
  const response = await fetch('/api/mercadopago/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paymentId })
  });
  
  return await response.json();
};
```

---

## 🔔 Webhooks

### Configurar Webhook en Mercado Pago
1. Ve a tu panel de Mercado Pago
2. Configuración > Webhooks
3. Agrega la URL: `https://tuapp.com/api/mercadopago/webhook`
4. Selecciona los eventos: `payment`

### Eventos Soportados
- `payment`: Cuando se actualiza el estado de un pago

### Validación de Webhook
```javascript
// El webhook se procesa automáticamente
// No requiere validación de firma como Stripe
// Mercado Pago envía los datos directamente
```

---

## 🎫 Validación de Tickets

### Validar Ticket en el Evento
```javascript
// App móvil o scanner
const validateTicket = async (ticketId, qrCode) => {
  const response = await fetch('/api/mercadopago/validate-ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ticketId, qrCode })
  });
  
  return await response.json();
};
```

### Estados del Ticket
- `valid`: Ticket válido y no usado
- `used`: Ticket ya ha sido usado
- `payment_pending`: Pago pendiente
- `invalid`: Ticket inválido

---

## 💰 Reembolsos

### Procesar Reembolso
```javascript
const processRefund = async (paymentId, amount, reason) => {
  const response = await fetch('/api/mercadopago/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      paymentId,
      amount,
      reason,
      description: 'Reembolso solicitado por el cliente'
    })
  });
  
  return await response.json();
};
```

---

## 📊 Ejemplos de Uso

### Frontend Completo
```javascript
// 1. Crear pago
const createEventPayment = async (event) => {
  try {
    const response = await fetch('/api/mercadopago/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        eventId: event.id,
        ticketType: 'vip',
        quantity: 1,
        currency: 'ARS'
      })
    });
    
    const data = await response.json();
    
    if (data.preference) {
      // Redirigir a Mercado Pago
      window.location.href = data.preference.init_point;
    }
  } catch (error) {
    console.error('Error creating payment:', error);
  }
};

// 2. Verificar estado del pago
const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await fetch(`/api/mercadopago/payment/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    return data.payment.status;
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
};

// 3. Obtener tickets del usuario
const getUserTickets = async () => {
  try {
    const response = await fetch('/api/mercadopago/tickets', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    return data.tickets;
  } catch (error) {
    console.error('Error getting tickets:', error);
  }
};
```

### Backend - Dashboard
```javascript
// Obtener estadísticas para el dashboard
const getPaymentStats = async () => {
  try {
    const response = await fetch('/api/mercadopago/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error getting stats:', error);
  }
};

// Buscar pagos recientes
const getRecentPayments = async () => {
  try {
    const response = await fetch('/api/mercadopago/search?status=approved&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.payments;
  } catch (error) {
    console.error('Error getting payments:', error);
  }
};
```

---

## 🔧 Solución de Problemas

### Error: "Access token no válido"
```bash
# Verificar que la variable de entorno esté configurada
echo $MERCADOPAGO_ACCESS_TOKEN

# Verificar que el token sea válido
curl -H "Authorization: Bearer $MERCADOPAGO_ACCESS_TOKEN" \
  https://api.mercadopago.com/users/me
```

### Error: "Webhook no recibido"
1. Verificar que la URL del webhook esté configurada correctamente
2. Verificar que el servidor esté accesible desde internet
3. Revisar los logs del servidor

### Error: "Pago no encontrado"
1. Verificar que el paymentId sea correcto
2. Verificar que el pago exista en Mercado Pago
3. Verificar que el pago esté en nuestra base de datos

### Error: "Ticket ya usado"
1. Verificar que el ticket no haya sido validado previamente
2. Verificar que el QR code sea correcto
3. Verificar que el pago esté aprobado

---

## 📱 Tipos de Pago Soportados

### Argentina
- **Tarjetas de crédito/débito**: Visa, Mastercard, American Express
- **Billeteras digitales**: Mercado Pago, Ualá, Personal Pay
- **Transferencias bancarias**: RapiPago, PagoFácil, Boleto Bancario
- **Cuotas sin interés**: Hasta 12 cuotas (según el banco)

### Monedas Soportadas
- **ARS**: Peso argentino (principal)
- **USD**: Dólar estadounidense
- **BRL**: Real brasileño

---

## 🎯 Próximos Pasos

1. **Configurar Mercado Pago** con tus credenciales reales
2. **Probar el flujo completo** en modo sandbox
3. **Implementar el frontend** para mostrar los botones de pago
4. **Configurar webhooks** en producción
5. **Monitorear pagos** en el dashboard de Mercado Pago

---

## 📞 Soporte

- **Documentación oficial**: [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
- **API Reference**: [Mercado Pago API](https://www.mercadopago.com.ar/developers/es/docs)
- **Soporte técnico**: [Mercado Pago Support](https://www.mercadopago.com.ar/developers/support)

---

¡Con esta integración tienes un sistema completo de pagos con Mercado Pago para Argentina! 🚀 