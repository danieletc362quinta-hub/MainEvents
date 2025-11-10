import React from 'react';
import { Card, CardContent, CardMedia, CardActions, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Tarjeta mejorada con animaciones, efectos hover y diseño responsive
 * 
 * Props:
 * - children: Contenido de la tarjeta
 * - image: URL de la imagen
 * - title: Título de la tarjeta
 * - subtitle: Subtítulo de la tarjeta
 * - actions: Acciones de la tarjeta
 * - elevation: Elevación de la sombra
 * - hover: Si debe tener efecto hover
 * - gradient: Si debe tener gradiente
 * - glow: Si debe tener efecto de brillo
 * - animation: Configuración de animación
 * - fullHeight: Si debe ocupar toda la altura disponible
 * - imageHeight: Altura de la imagen
 * - borderRadius: Radio de borde
 */
const EnhancedCard = ({
  children,
  image,
  title,
  subtitle,
  actions,
  elevation = 2,
  hover = true,
  gradient = false,
  glow = false,
  animation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },
  fullHeight = false,
  imageHeight = 200,
  borderRadius = 2,
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const cardStyles = {
    height: fullHeight ? '100%' : 'auto',
    borderRadius: theme.spacing(borderRadius),
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: hover ? 'pointer' : 'default',
    background: gradient 
      ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      : theme.palette.background.paper,
    backdropFilter: gradient ? 'blur(10px)' : 'none',
    border: gradient ? '1px solid rgba(255,255,255,0.2)' : 'none',
    ...sx,
    ...(hover && {
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: glow 
          ? '0 20px 40px rgba(0,0,0,0.15), 0 0 20px rgba(102, 126, 234, 0.3)'
          : theme.shadows[8],
        '& .card-image': {
          transform: 'scale(1.05)',
        },
        '& .card-content': {
          transform: 'translateY(-4px)',
        }
      }
    })
  };

  const imageStyles = {
    height: isMobile ? imageHeight * 0.8 : imageHeight,
    objectFit: 'cover',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%'
  };

  const contentStyles = {
    padding: isMobile ? theme.spacing(2) : theme.spacing(3),
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    zIndex: 1
  };

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
    >
      <Card
        elevation={elevation}
        sx={cardStyles}
        {...props}
      >
        {image && (
          <CardMedia
            component="img"
            image={image}
            alt={title || 'Card image'}
            className="card-image"
            sx={imageStyles}
          />
        )}
        
        <CardContent className="card-content" sx={contentStyles}>
          {title && (
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                margin: 0,
                marginBottom: subtitle ? theme.spacing(1) : theme.spacing(2),
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: 600,
                color: theme.palette.text.primary,
                lineHeight: 1.2
              }}
            >
              {title}
            </motion.h3>
          )}
          
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{
                margin: 0,
                marginBottom: theme.spacing(2),
                fontSize: isMobile ? '0.875rem' : '1rem',
                color: theme.palette.text.secondary,
                lineHeight: 1.4
              }}
            >
              {subtitle}
            </motion.p>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {children}
          </motion.div>
        </CardContent>
        
        {actions && (
          <CardActions
            sx={{
              padding: theme.spacing(2, 3),
              paddingTop: 0,
              justifyContent: 'flex-end',
              gap: theme.spacing(1)
            }}
          >
            {actions}
          </CardActions>
        )}
      </Card>
    </motion.div>
  );
};

export default EnhancedCard;




