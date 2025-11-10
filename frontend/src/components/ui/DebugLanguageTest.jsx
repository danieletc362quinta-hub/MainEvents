import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useDebugLanguage } from '../../contexts/DebugLanguageContext';

const DebugLanguageTest = () => {
  const { t, language, changeLanguage } = useDebugLanguage();

  console.log('🔧 DebugLanguageTest render - current language:', language);

  return (
    <Paper sx={{ p: 3, m: 2, bgcolor: 'yellow.100' }}>
      <Typography variant="h6" gutterBottom color="primary">
        🔧 DEBUG Language Test Component
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          Current Language: <strong>{language}</strong>
        </Typography>
        <Typography variant="body1">
          Translation Test: {t('nav.home')}
        </Typography>
        <Typography variant="body1">
          Translation Test 2: {t('nav.events')}
        </Typography>
        <Typography variant="body1">
          Translation Test 3: {t('test.title')}
        </Typography>
        <Typography variant="body1">
          Translation Test 4: {t('test.description')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant={language === 'es' ? 'contained' : 'outlined'}
          onClick={() => {
            console.log('🔧 Button clicked: changing to Spanish');
            changeLanguage('es');
          }}
        >
          🇪🇸 Español
        </Button>
        <Button
          variant={language === 'en' ? 'contained' : 'outlined'}
          onClick={() => {
            console.log('🔧 Button clicked: changing to English');
            changeLanguage('en');
          }}
        >
          🇺🇸 English
        </Button>
      </Box>
    </Paper>
  );
};

export default DebugLanguageTest;
