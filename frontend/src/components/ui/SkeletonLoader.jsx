import React from 'react';
import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material';

// Skeleton para tarjetas de eventos
export const EventCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent sx={{ flexGrow: 1 }}>
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={60} height={24} />
        <Skeleton variant="text" width={80} height={24} />
      </Box>
    </CardContent>
  </Card>
);

// Skeleton para lista de eventos
export const EventsListSkeleton = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <EventCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// Skeleton para formularios
export const FormSkeleton = () => (
  <Box sx={{ maxWidth: 600, mx: 'auto' }}>
    <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
    
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={120} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" width={200} height={48} />
      </Grid>
    </Grid>
  </Box>
);

// Skeleton para tabla
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box>
    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
    {Array.from({ length: rows }).map((_, index) => (
      <Box key={index} sx={{ display: 'flex', mb: 1 }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="text"
            width={`${100 / columns}%`}
            height={40}
            sx={{ mr: 1 }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

// Skeleton para perfil de usuario
export const ProfileSkeleton = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Skeleton variant="circular" width={80} height={80} sx={{ mr: 2 }} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={24} />
      </Box>
    </Box>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
      </Grid>
    </Grid>
  </Box>
);

// Skeleton para dashboard
export const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
    
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={32} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="70%" height={32} sx={{ mb: 2 }} />
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
                <Skeleton variant="text" width="80%" height={24} />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

// Skeleton para notificaciones
export const NotificationsSkeleton = () => (
  <Box>
    {Array.from({ length: 5 }).map((_, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// Skeleton para pagos
export const PaymentsSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
    
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={60} height={20} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// Skeleton para cupones
export const CouponsSkeleton = () => (
  <Grid container spacing={3}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width={100} height={32} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

// Skeleton genérico para contenido
export const ContentSkeleton = ({ variant = 'text', width = '100%', height = 20, ...props }) => (
  <Skeleton variant={variant} width={width} height={height} {...props} />
);

// Skeleton para página completa
export const PageSkeleton = ({ title = true, content = 'form' }) => (
  <Box sx={{ py: 4 }}>
    {title && <Skeleton variant="text" width="50%" height={40} sx={{ mb: 4 }} />}
    
    {content === 'form' && <FormSkeleton />}
    {content === 'table' && <TableSkeleton />}
    {content === 'profile' && <ProfileSkeleton />}
    {content === 'dashboard' && <DashboardSkeleton />}
    {content === 'notifications' && <NotificationsSkeleton />}
    {content === 'payments' && <PaymentsSkeleton />}
    {content === 'coupons' && <CouponsSkeleton />}
    {content === 'events' && <EventsListSkeleton />}
  </Box>
); 
