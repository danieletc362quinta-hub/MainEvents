import React from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Box,
  useTheme, 
  useMediaQuery 
} from '@mui/material';

const ResponsiveTextField = ({ 
  fullWidth = true,
  size = 'medium',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TextField
      fullWidth={fullWidth}
      size={isMobile ? 'small' : size}
      sx={{
        [theme.breakpoints.down('sm')]: {
          '& .MuiInputBase-root': {
            fontSize: '0.875rem',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
          }
        }
      }}
      {...props}
    />
  );
};

const ResponsiveSelect = ({ 
  fullWidth = true,
  size = 'medium',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FormControl
      fullWidth={fullWidth}
      size={isMobile ? 'small' : size}
      sx={{
        [theme.breakpoints.down('sm')]: {
          '& .MuiInputBase-root': {
            fontSize: '0.875rem',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
          }
        }
      }}
    >
      {props.label && <InputLabel>{props.label}</InputLabel>}
      <Select {...props}>
        {props.children}
      </Select>
    </FormControl>
  );
};

const ResponsiveFormControl = ({ 
  children, 
  fullWidth = true,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <FormControl
      fullWidth={fullWidth}
      size={isMobile ? 'small' : 'medium'}
      sx={{
        [theme.breakpoints.down('sm')]: {
          marginBottom: theme.spacing(1),
        }
      }}
      {...props}
    >
      {children}
    </FormControl>
  );
};

const ResponsiveFormGrid = ({ 
  children, 
  spacing = 2,
  columns = { xs: 1, sm: 2 },
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        },
        gap: isMobile ? theme.spacing(1) : theme.spacing(spacing),
        [theme.breakpoints.down('sm')]: {
          gridTemplateColumns: '1fr',
        },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export {
  ResponsiveTextField,
  ResponsiveSelect,
  ResponsiveFormControl,
  ResponsiveFormGrid
};
