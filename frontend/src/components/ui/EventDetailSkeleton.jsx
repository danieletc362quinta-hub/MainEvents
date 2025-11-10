import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Skeleton,
  Grid,
  Container,
  Paper,
  Stack,
  Divider,
} from '@mui/material';

const EventDetailSkeleton = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header skeleton */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton variant="rectangular" width={100} height={32} />
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
            <Skeleton variant="text" width="80%" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={30} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={4}>
        {/* Contenido principal */}
        <Grid item xs={12} lg={8}>
          {/* Imagen skeleton */}
          <Card sx={{ mb: 4, overflow: 'hidden' }}>
            <Skeleton variant="rectangular" height={400} />
          </Card>

          {/* Tabs skeleton */}
          <Card sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Skeleton variant="text" width={100} height={30} />
                <Skeleton variant="text" width={120} height={30} />
                <Skeleton variant="text" width={100} height={30} />
              </Box>
            </Box>
            <CardContent>
              <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="85%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="70%" height={20} sx={{ mb: 3 }} />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Skeleton variant="rectangular" width={80} height={24} />
                <Skeleton variant="rectangular" width={70} height={24} />
                <Skeleton variant="rectangular" width={90} height={24} />
              </Box>
            </CardContent>
          </Card>

          {/* Información adicional skeleton */}
          <Card>
            <CardContent>
              <Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" width="100%" height={60} />
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar skeleton */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Skeleton variant="text" width="60%" height={50} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width="40%" height={20} sx={{ mx: 'auto' }} />
              </Box>

              <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />

              <Divider sx={{ my: 3 }} />

              {/* Fecha y hora skeleton */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width="40%" height={30} />
                </Box>
                <Skeleton variant="text" width="70%" height={20} sx={{ ml: 4, mb: 1 }} />
                <Skeleton variant="text" width="50%" height={16} sx={{ ml: 4 }} />
              </Box>

              {/* Ubicación skeleton */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width="30%" height={30} />
                </Box>
                <Skeleton variant="text" width="80%" height={20} sx={{ ml: 4, mb: 1 }} />
                <Skeleton variant="rectangular" width={120} height={32} sx={{ ml: 4 }} />
              </Box>

              {/* Capacidad skeleton */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="text" width="35%" height={30} />
                </Box>
                <Skeleton variant="text" width="60%" height={20} sx={{ ml: 4, mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={6} sx={{ ml: 4, borderRadius: 3 }} />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Estadísticas skeleton */}
              <Box>
                <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="text" width="20%" height={16} />
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="35%" height={20} />
                    <Skeleton variant="text" width="25%" height={16} />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventDetailSkeleton; 
