import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Button, ButtonGroup } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

const LanguageSwitcher = () => {
  const { changeLanguage, currentLanguage } = useTranslation();
  
  return (
    <ButtonGroup 
      size="small" 
      variant="outlined" 
      color="inherit"
      sx={{ ml: 2 }}
    >
      <Button
        startIcon={<LanguageIcon />}
        onClick={() => changeLanguage('es')}
        variant={currentLanguage === 'es' ? 'contained' : 'outlined'}
        disabled={currentLanguage === 'es'}
      >
        ES
      </Button>
      <Button
        onClick={() => changeLanguage('en')}
        variant={currentLanguage === 'en' ? 'contained' : 'outlined'}
        disabled={currentLanguage === 'en'}
      >
        EN
      </Button>
    </ButtonGroup>
  );
};

export default LanguageSwitcher;
