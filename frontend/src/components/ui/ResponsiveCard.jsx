import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia,
  useTheme, 
  useMediaQuery 
} from '@mui/material';

const ResponsiveCard = ({ 
  children, 
  image,
  imageHeight = 200,
  actions,
  elevation = 1,
  hover = true,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      elevation={elevation}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: hover ? 'all 0.3s ease-in-out' : 'none',
        '&:hover': hover ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
        [theme.breakpoints.down('sm')]: {
          '& .MuiCardContent-root': {
            padding: theme.spacing(1.5),
          },
          '& .MuiCardActions-root': {
            padding: theme.spacing(1),
          }
        },
        ...props.sx
      }}
      {...props}
    >
      {image && (
        <CardMedia
          component="img"
          height={isMobile ? imageHeight * 0.8 : imageHeight}
          image={image}
          alt="Card image"
          sx={{
            objectFit: 'cover',
            [theme.breakpoints.down('sm')]: {
              height: imageHeight * 0.6,
            }
          }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1 }}>
        {children}
      </CardContent>
      
      {actions && (
        <CardActions>
          {actions}
        </CardActions>
      )}
    </Card>
  );
};

export default ResponsiveCard;
