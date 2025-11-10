import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  useTheme, 
  useMediaQuery 
} from '@mui/material';

const ResponsiveTable = ({ 
  children, 
  stickyHeader = false,
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TableContainer
      component={Paper}
      sx={{
        [theme.breakpoints.down('sm')]: {
          '& .MuiTableCell-root': {
            padding: theme.spacing(0.5),
            fontSize: '0.75rem',
          },
          '& .MuiTableHead-root .MuiTableCell-root': {
            fontSize: '0.7rem',
            fontWeight: 600,
          }
        }
      }}
      {...props}
    >
      <Table stickyHeader={stickyHeader}>
        {children}
      </Table>
    </TableContainer>
  );
};

export const ResponsiveTableHead = ({ children, ...props }) => {
  return (
    <TableHead {...props}>
      {children}
    </TableHead>
  );
};

export const ResponsiveTableBody = ({ children, ...props }) => {
  return (
    <TableBody {...props}>
      {children}
    </TableBody>
  );
};

export const ResponsiveTableRow = ({ children, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TableRow
      sx={{
        [theme.breakpoints.down('sm')]: {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          }
        }
      }}
      {...props}
    >
      {children}
    </TableRow>
  );
};

export const ResponsiveTableCell = ({ 
  children, 
  align = 'left',
  ...props 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TableCell
      align={align}
      sx={{
        [theme.breakpoints.down('sm')]: {
          padding: theme.spacing(0.5),
          fontSize: '0.75rem',
          '&:first-of-type': {
            paddingLeft: theme.spacing(1),
          },
          '&:last-of-type': {
            paddingRight: theme.spacing(1),
          }
        }
      }}
      {...props}
    >
      {children}
    </TableCell>
  );
};

export default ResponsiveTable;
