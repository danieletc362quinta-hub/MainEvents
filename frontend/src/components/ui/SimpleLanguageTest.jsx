import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const SimpleLanguageTest = () => {
  const { t, language, changeLanguage } = useLanguage();
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log('🔄 SimpleLanguageTest render #', renderCount + 1, '- language:', language);
  }, [language, renderCount]);

  const handleLanguageChange = (newLang) => {
    console.log('🌍 SimpleLanguageTest: Button clicked, changing to', newLang);
    changeLanguage(newLang);
  };

  return (
    <Paper sx={{ p: 2, m: 2, bgcolor: 'lightblue' }}>
      <Typography variant="h6" gutterBottom>
        🔧 Simple Language Test (Render #{renderCount})
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Current Language:</strong> {language}
        </Typography>
        <Typography variant="body1">
          <strong>Translation Test:</strong> {t('nav.home')}
        </Typography>
        <Typography variant="body1">
          <strong>Translation Test 2:</strong> {t('nav.events')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant={language === 'es' ? 'contained' : 'outlined'}
          onClick={() => handleLanguageChange('es')}
          sx={{ bgcolor: language === 'es' ? 'primary.main' : 'transparent' }}
        >
          🇪🇸 Español
        </Button>
        <Button
          variant={language === 'en' ? 'contained' : 'outlined'}
          onClick={() => handleLanguageChange('en')}
          sx={{ bgcolor: language === 'en' ? 'primary.main' : 'transparent' }}
        >
          🇺🇸 English
        </Button>
      </Box>
    </Paper>
  );
};

export default SimpleLanguageTest;
