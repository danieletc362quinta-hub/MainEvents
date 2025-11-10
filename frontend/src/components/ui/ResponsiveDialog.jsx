import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  useTheme, 
  useMediaQuery 
} from '@mui/material';

const ResponsiveDialog = ({ 
  open, 
  onClose, 
  title,
  children,
  actions,
  fullScreen = false,
  maxWidth = 'sm',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile || fullScreen}
      maxWidth={isMobile ? 'sm' : maxWidth}
      fullWidth
      sx={{
        [theme.breakpoints.down('sm')]: {
          '& .MuiDialog-paper': {
            margin: theme.spacing(1),
            width: 'calc(100% - 16px)',
            maxHeight: 'calc(100% - 16px)',
          }
        }
      }}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            [theme.breakpoints.down('sm')]: {
              fontSize: '1.1rem',
              padding: theme.spacing(2, 2, 1),
            }
          }}
        >
          {title}
        </DialogTitle>
      )}
      
      <DialogContent
        sx={{
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(1, 2),
          }
        }}
      >
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions
          sx={{
            [theme.breakpoints.down('sm')]: {
              padding: theme.spacing(1, 2, 2),
              flexDirection: 'column',
              gap: 1,
              '& > *': {
                width: '100%',
              }
            }
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ResponsiveDialog;
