import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Chip,
  Alert
} from '@mui/material';
import { useLanguage } from '../../contexts/UnifiedLanguageContext';

const TranslationTest = () => {
  const { t, language, changeLanguage } = useLanguage();

  const testSections = [
    {
      title: 'pages.home.title',
      items: [
        'pages.home.subtitle',
        'pages.home.featuredEvents',
        'pages.home.upcomingEvents',
        'pages.home.categories',
        'pages.home.whyChooseUs',
        'pages.home.testimonials',
        'pages.home.stats',
        'pages.home.joinNow',
        'pages.home.learnMore'
      ]
    },
    {
      title: 'forms.createEvent.title',
      items: [
        'forms.createEvent.basicInfo',
        'forms.createEvent.eventDetails',
        'forms.createEvent.pricing',
        'forms.createEvent.media',
        'forms.createEvent.settings',
        'forms.createEvent.publish',
        'forms.createEvent.saveDraft',
        'forms.createEvent.preview'
      ]
    },
    {
      title: 'actions.title',
      items: [
        'actions.add',
        'actions.edit',
        'actions.delete',
        'actions.save',
        'actions.cancel',
        'actions.confirm',
        'actions.close',
        'actions.open',
        'actions.view',
        'actions.download',
        'actions.upload',
        'actions.search',
        'actions.filter',
        'actions.sort',
        'actions.refresh',
        'actions.reload',
        'actions.back',
        'actions.next',
        'actions.previous',
        'actions.finish',
        'actions.submit',
        'actions.reset',
        'actions.clear',
        'actions.select',
        'actions.deselect',
        'actions.enable',
        'actions.disable',
        'actions.activate',
        'actions.deactivate',
        'actions.publish',
        'actions.unpublish',
        'actions.approve',
        'actions.reject',
        'actions.accept',
        'actions.decline',
        'actions.invite',
        'actions.join',
        'actions.leave',
        'actions.follow',
        'actions.unfollow',
        'actions.like',
        'actions.unlike',
        'actions.share',
        'actions.copy',
        'actions.paste',
        'actions.cut',
        'actions.undo',
        'actions.redo',
        'actions.print',
        'actions.export',
        'actions.import',
        'actions.sync',
        'actions.backup',
        'actions.restore',
        'actions.archive',
        'actions.unarchive',
        'actions.duplicate',
        'actions.move',
        'actions.rename',
        'actions.create',
        'actions.update',
        'actions.remove',
        'actions.retry',
        'actions.continue',
        'actions.skip',
        'actions.complete',
        'actions.start',
        'actions.stop',
        'actions.pause',
        'actions.resume',
        'actions.play',
        'actions.mute',
        'actions.unmute',
        'actions.fullscreen',
        'actions.exitFullscreen',
        'actions.zoomIn',
        'actions.zoomOut',
        'actions.fit',
        'actions.rotate',
        'actions.flip',
        'actions.crop',
        'actions.resize',
        'actions.compress',
        'actions.extract',
        'actions.encrypt',
        'actions.decrypt',
        'actions.lock',
        'actions.unlock',
        'actions.hide',
        'actions.show',
        'actions.expand',
        'actions.collapse',
        'actions.maximize',
        'actions.minimize',
        'actions.new',
        'actions.old',
        'actions.recent',
        'actions.popular',
        'actions.trending',
        'actions.featured',
        'actions.recommended',
        'actions.suggested',
        'actions.related',
        'actions.similar',
        'actions.other',
        'actions.all',
        'actions.none',
        'actions.some',
        'actions.many',
        'actions.few',
        'actions.more',
        'actions.less',
        'actions.most',
        'actions.least',
        'actions.best',
        'actions.worst',
        'actions.better',
        'actions.worse',
        'actions.good',
        'actions.bad',
        'actions.great',
        'actions.terrible',
        'actions.awesome',
        'actions.amazing',
        'actions.wonderful',
        'actions.fantastic',
        'actions.perfect',
        'actions.excellent',
        'actions.outstanding',
        'actions.remarkable',
        'actions.impressive',
        'actions.incredible',
        'actions.unbelievable',
        'actions.extraordinary',
        'actions.exceptional',
        'actions.magnificent',
        'actions.splendid',
        'actions.superb',
        'actions.terrific',
        'actions.fabulous',
        'actions.marvelous',
        'actions.brilliant'
      ]
    },
    {
      title: 'validation.title',
      items: [
        'validation.required',
        'validation.email',
        'validation.minLength',
        'validation.maxLength',
        'validation.password',
        'validation.confirmPassword',
        'validation.phone',
        'validation.url',
        'validation.date',
        'validation.time',
        'validation.number',
        'validation.positive',
        'validation.future',
        'validation.past'
      ]
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('common.translationTest') || 'Translation Test'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={language === 'es' ? 'contained' : 'outlined'}
              onClick={() => changeLanguage('es')}
              size="small"
            >
              🇪🇸 Español
            </Button>
            <Button
              variant={language === 'en' ? 'contained' : 'outlined'}
              onClick={() => changeLanguage('en')}
              size="small"
            >
              🇺🇸 English
            </Button>
          </Box>
        </Box>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {t('common.currentLanguage') || 'Current Language'}: <strong>{language.toUpperCase()}</strong>
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {testSections.map((section, sectionIndex) => (
            <Grid item xs={12} md={6} lg={4} key={sectionIndex}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom color="primary">
                  {t(section.title) || section.title}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {section.items.map((item, itemIndex) => (
                    <Box key={itemIndex} sx={{ mb: 1 }}>
                      <Chip
                        label={t(item) || item}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 0.5, mr: 0.5 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            {t('common.testInstructions') || 'Test Instructions'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('common.testInstructionsDescription') || 
              'Click the language buttons above to test the translation system. All text should change immediately when switching between Spanish and English.'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default TranslationTest;
