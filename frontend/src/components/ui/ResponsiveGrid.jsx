import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Grid responsive que se adapta automáticamente a diferentes tamaños de pantalla
 * 
 * Props:
 * - children: Elementos del grid
 * - spacing: Espaciado entre elementos
 * - animation: Configuración de animación
 * - stagger: Si debe animar elementos de forma escalonada
 * - container: Si es un contenedor de grid
 * - item: Si es un elemento del grid
 * - xs: Columnas en pantallas extra pequeñas
 * - sm: Columnas en pantallas pequeñas
 * - md: Columnas en pantallas medianas
 * - lg: Columnas en pantallas grandes
 * - xl: Columnas en pantallas extra grandes
 */
const ResponsiveGrid = ({
  children,
  spacing = 2,
  animation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  stagger = false,
  container = false,
  item = false,
  xs = 12,
  sm = 6,
  md = 4,
  lg = 3,
  xl = 2,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Configuración responsive automática
  const responsiveConfig = {
    xs: isMobile ? 12 : xs, // En móvil, siempre 1 columna
    sm: isMobile ? 12 : isTablet ? 6 : sm, // En tablet, máximo 2 columnas
    md: isMobile ? 12 : isTablet ? 6 : md,
    lg: isMobile ? 12 : isTablet ? 6 : lg,
    xl: isMobile ? 12 : isTablet ? 6 : xl
  };

  const gridStyles = {
    ...sx
  };

  // Si es un contenedor, renderizar con Grid container
  if (container) {
    return (
      <Grid
        container
        spacing={spacing}
        sx={gridStyles}
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            initial={animation.initial}
            animate={animation.animate}
            transition={{
              ...animation.transition,
              delay: stagger ? index * 0.1 : 0
            }}
            style={{ width: '100%' }}
          >
            {child}
          </motion.div>
        ))}
      </Grid>
    );
  }

  // Si es un elemento individual
  if (item) {
    return (
      <motion.div
        initial={animation.initial}
        animate={animation.animate}
        transition={animation.transition}
      >
        <Grid
          item
          xs={responsiveConfig.xs}
          sm={responsiveConfig.sm}
          md={responsiveConfig.md}
          lg={responsiveConfig.lg}
          xl={responsiveConfig.xl}
          sx={gridStyles}
          {...props}
        >
          {children}
        </Grid>
      </motion.div>
    );
  }

  // Grid simple con animación
  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
    >
      <Grid
        container
        spacing={spacing}
        sx={gridStyles}
        {...props}
      >
        {children}
      </Grid>
    </motion.div>
  );
};

export default ResponsiveGrid;