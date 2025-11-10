import React from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import { Help as HelpIcon } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const HelpButton = ({ 
  onClick, 
  showBadge = false, 
  badgeContent = 0,
  placement = 'top',
  size = 'medium',
  color = 'primary',
  variant = 'contained'
}) => {
  const { t } = useLanguage();

  const button = (
    <IconButton
      onClick={onClick}
      size={size}
      color={color}
      sx={{
        ...(variant === 'contained' && {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            backgroundColor: 'primary.dark',
          }
        }),
        ...(variant === 'outlined' && {
          border: '1px solid',
          borderColor: 'primary.main',
          color: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
          }
        })
      }}
    >
      <HelpIcon />
    </IconButton>
  );

  if (showBadge) {
    return (
      <Badge badgeContent={badgeContent} color="error">
        <Tooltip title={t('help.title')} placement={placement}>
          {button}
        </Tooltip>
      </Badge>
    );
  }

  return (
    <Tooltip title={t('help.title')} placement={placement}>
      {button}
    </Tooltip>
  );
};

export default HelpButton;
